const { spawn } = require("child_process");
const Expense = require("../models/Expense.js");
const Goal = require("../models/Goal.js");

/**
 * Chạy Python Prophet
 */
const runProphet = (prophetData, periods = 1, type = "month") => {
  return new Promise((resolve, reject) => {
    const pythonPath = process.platform === "win32" ? "python" : "python3";
    const freq = type === "day" ? "day" : "month";
    const python = spawn(pythonPath, [
      "controllers/predict_prophet.py",
      periods,
      freq,
    ]);

    let predictionResult = "";
    let errorOutput = "";

    python.stdin.write(JSON.stringify(prophetData));
    python.stdin.end();

    python.stdout.on("data", (data) => {
      predictionResult += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        console.error("Python script error:", errorOutput);
        reject(new Error("Prediction failed"));
      } else {
        try {
          const prediction = JSON.parse(predictionResult);
          resolve(prediction);
        } catch (err) {
          reject(new Error("Failed to parse prediction result"));
        }
      }
    });
  });
};

/**
 * Gom chi tiêu theo tháng
 */
const aggregateMonthlyExpenses = (expenses) => {
  const data = {};
  expenses.forEach((expense) => {
    const key = expense.date.toISOString().substring(0, 7); // YYYY-MM
    data[key] = (data[key] || 0) + expense.amount;
  });
  return data;
};

/**
 * Gom chi tiêu theo ngày hoặc tháng
 */
const aggregateExpenses = (expenses, type = "month") => {
  const data = {};
  expenses.forEach((expense) => {
    let key;
    if (type === "day") {
      key = expense.date.toISOString().substring(0, 10); // YYYY-MM-DD
    } else {
      key = expense.date.toISOString().substring(0, 7); // YYYY-MM
    }
    data[key] = (data[key] || 0) + expense.amount;
  });
  return data;
};

/**
 * Bổ sung các ngày bị thiếu với giá trị 0 (cho dự đoán theo ngày)
 */
const fillMissingDays = (groupedData, startDate, endDate) => {
  const filledData = {};
  let current = new Date(startDate);
  while (current <= endDate) {
    const key = current.toISOString().substring(0, 10); // YYYY-MM-DD
    filledData[key] = groupedData[key] || 0;
    current.setDate(current.getDate() + 1);
  }
  return filledData;
};

/**
 * Bổ sung các ngày bị thiếu với giá trị gần nhất trước đó
 */
const fillMissingDaysWithLastValue = (groupedData, startDate, endDate) => {
  const filledData = {};
  let current = new Date(startDate);
  let lastValue = 0;
  while (current <= endDate) {
    const key = current.toISOString().substring(0, 10); // YYYY-MM-DD
    if (groupedData.hasOwnProperty(key)) {
      lastValue = groupedData[key];
      filledData[key] = groupedData[key];
    } else {
      filledData[key] = lastValue; // lấy giá trị gần nhất trước đó, nếu chưa có thì là 0
    }
    current.setDate(current.getDate() + 1);
  }
  return filledData;
};

/**
 * Dự đoán chi tiêu theo tháng hoặc ngày
 */
const predictMonthlyExpense = async (
  userId,
  dateFilter,
  periods = 1,
  type = "month"
) => {
  const expenses = await Expense.find({ userId, ...dateFilter }).sort({
    date: 1,
  });

  if (!expenses.length)
    return { prediction: 0, chartData: [], historicalData: [] };

  let groupedData = aggregateExpenses(expenses, type);

  // Nếu dự đoán theo ngày, bổ sung các ngày bị thiếu với giá trị 0
  let prophetData;
  if (type === "day") {
    const keys = Object.keys(groupedData);
    const start = keys.length ? new Date(keys[0]) : new Date();
    const end = keys.length ? new Date(keys[keys.length - 1]) : new Date();
    const filledData = fillMissingDays(groupedData, start, end);
    prophetData = Object.entries(filledData).map(([key, amount]) => ({
      ds: key,
      y: amount,
    }));
    groupedData = filledData; // historicalData cũng cần đủ ngày liên tục
  } else {
    prophetData = Object.entries(groupedData).map(([key, amount]) => ({
      ds: key + "-01",
      y: amount,
    }));
  }

  let predictions = [];
  try {
    if (prophetData.length >= 2) {
      // Truyền periods và type sang Python
      const prediction = await runProphet(prophetData, periods, type);
      predictions = Array.isArray(prediction.prediction)
        ? prediction.prediction
        : [prediction.prediction];
    } else {
      predictions = [prophetData[0].y];
    }
  } catch (err) {
    predictions = prophetData.length
      ? [prophetData.reduce((a, b) => a + b.y, 0) / prophetData.length]
      : [0];
  }

  const historicalData = Object.entries(groupedData).map(([key, amount]) => ({
    key,
    amount,
  }));

  // Tạo chartData gồm dữ liệu thực + các giá trị dự đoán cho các ngày/tháng tiếp theo
  let chartData = [...historicalData];
  let lastDate =
    historicalData.length > 0
      ? new Date(
          type === "day"
            ? historicalData[historicalData.length - 1].key
            : historicalData[historicalData.length - 1].key + "-01"
        )
      : new Date();

  for (let i = 0; i < predictions.length; i++) {
    if (type === "day") {
      lastDate.setDate(lastDate.getDate() + 1);
      const nextDay = lastDate.toISOString().substring(0, 10);
      chartData.push({ key: nextDay, amount: predictions[i] });
    } else {
      lastDate.setMonth(lastDate.getMonth() + 1);
      const nextMonth = lastDate.toISOString().substring(0, 7);
      chartData.push({ key: nextMonth, amount: predictions[i] });
    }
  }

  return {
    prediction: parseFloat(predictions[0]?.toFixed(2) ?? 0),
    chartData: chartData.map((item) => ({
      month: item.key, // đổi key thành month
      amount: item.amount,
    })),
    historicalData: historicalData.map((item) => ({
      month: item.key,
      amount: item.amount,
    })),
    predictions,
  };
};

/**
 * API chính: Chỉ dự đoán theo tháng
 */
exports.getPrediction = async (req, res) => {
  const userId = req.user.id;
  const { periods, type, value } = req.query;

  try {
    if (type === "day") {
      // Ngày cuối cùng user cập nhật chi tiêu
      const lastExpense = await Expense.findOne({ userId }).sort({ date: -1 });
      if (!lastExpense) {
        // Không có chi tiêu nào
        return res.status(200).json({
          prediction: 0,
          chartData: [],
          historicalData: [],
          predictions: [0],
        });
      }
      const endDate = value ? new Date(value) : lastExpense.date;
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 6); // lấy 7 ngày liên tục

      // Lấy tất cả chi tiêu trong khoảng đó
      const expenses = await Expense.find({
        userId,
        date: { $gte: startDate, $lte: endDate },
      }).sort({ date: 1 });

      // Gom nhóm theo ngày
      const groupedData = aggregateExpenses(expenses, "day");
      // Fill các ngày bị thiếu bằng giá trị gần nhất trước đó (hoặc 0)
      const filledData = fillMissingDaysWithLastValue(
        groupedData,
        startDate,
        endDate
      );

      // Kiểm tra nếu tất cả 7 ngày đều là 0 thì trả về 0
      const allZero = Object.values(filledData).every((v) => v === 0);
      if (allZero) {
        return res.status(200).json({
          prediction: 0,
          chartData: Object.entries(filledData).map(([key, amount]) => ({
            key,
            amount,
          })),
          historicalData: Object.entries(filledData).map(([key, amount]) => ({
            key,
            amount,
          })),
          predictions: [0],
        });
      }

      // Format cho Prophet
      const prophetData = Object.entries(filledData).map(([key, amount]) => ({
        ds: key,
        y: amount,
      }));

      // Dự đoán như cũ
      const prediction = await runProphet(
        prophetData,
        periods ? Number(periods) : 1,
        "day"
      );

      // Format lại chartData, historicalData
      const historicalData = Object.entries(filledData).map(
        ([key, amount]) => ({
          key,
          amount,
        })
      );

      let chartData = [...historicalData];
      let lastDate = endDate;
      for (
        let i = 0;
        i <
        (Array.isArray(prediction.prediction)
          ? prediction.prediction.length
          : 1);
        i++
      ) {
        lastDate.setDate(lastDate.getDate() + 1);
        const nextDay = lastDate.toISOString().substring(0, 10);
        chartData.push({
          key: nextDay,
          amount: Array.isArray(prediction.prediction)
            ? prediction.prediction[i]
            : prediction.prediction,
        });
      }

      return res.status(200).json({
        prediction: Array.isArray(prediction.prediction)
          ? prediction.prediction[0]
          : prediction.prediction,
        chartData: chartData.map((item) => ({
          month: item.key, // đổi key thành month
          amount: item.amount,
        })),
        historicalData: historicalData.map((item) => ({
          month: item.key,
          amount: item.amount,
        })),
        predictions: prediction.prediction,
      });
    } else if (type === "month" && value) {
      // Nếu chọn tháng, lấy từ 2 tháng trước đến tháng được chọn
      const endDate = new Date(value + "-01");
      endDate.setMonth(endDate.getMonth() + 1);
      const startDate = new Date(value + "-01");
      startDate.setMonth(startDate.getMonth() - 2);
      dateFilter = { date: { $gte: startDate, $lt: endDate } };
    } else {
      // Mặc định: 2 tháng gần nhất
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      dateFilter = { date: { $gte: twoMonthsAgo } };
    }

    // Truyền periods và type vào hàm dự đoán
    const result = await predictMonthlyExpense(
      userId,
      dateFilter,
      periods ? Number(periods) : 1,
      type || "month"
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * API Goals
 */
exports.getGoals = async (req, res) => {
  const userId = req.user.id;
  try {
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
