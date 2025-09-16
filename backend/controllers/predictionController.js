const { spawn } = require("child_process");
const Expense = require("../models/Expense.js");
const Goal = require("../models/Goal.js");

/**
 * Chạy Python Prophet
 */
const runProphet = (prophetData, periods = 1) => {
  return new Promise((resolve, reject) => {
    const pythonPath = process.platform === "win32" ? "python" : "python3";

    // Truyền periods sang Python
    const python = spawn(pythonPath, [
      "controllers/predict_prophet.py",
      periods,
      "month",
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
 * Dự đoán chi tiêu theo tháng
 */
const predictMonthlyExpense = async (userId, dateFilter, periods = 1) => {
  const expenses = await Expense.find({ userId, ...dateFilter }).sort({
    date: 1,
  });

  if (!expenses.length)
    return { prediction: 0, chartData: [], historicalData: [] };

  const monthlyData = aggregateMonthlyExpenses(expenses);
  const prophetData = Object.entries(monthlyData).map(([month, amount]) => ({
    ds: month + "-01",
    y: amount,
  }));

  let predictions = [];
  try {
    if (prophetData.length >= 2) {
      // Truyền periods sang Python
      const prediction = await runProphet(prophetData, periods);
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

  const historicalData = Object.entries(monthlyData).map(([month, amount]) => ({
    key: month,
    amount: amount,
  }));

  // Tạo chartData gồm dữ liệu thực + các giá trị dự đoán cho các tháng tiếp theo
  let chartData = [...historicalData];
  let lastMonth =
    historicalData.length > 0
      ? new Date(historicalData[historicalData.length - 1].key + "-01")
      : new Date();

  for (let i = 0; i < predictions.length; i++) {
    lastMonth.setMonth(lastMonth.getMonth() + 1);
    const nextMonth = lastMonth.toISOString().substring(0, 7);
    chartData.push({ key: nextMonth, amount: predictions[i] });
  }

  return {
    prediction: parseFloat(predictions[0]?.toFixed(2) ?? 0), // giá trị đầu tiên
    chartData,
    historicalData,
    predictions, // trả về mảng dự đoán nếu cần
  };
};

/**
 * API chính: Chỉ dự đoán theo tháng
 */
exports.getPrediction = async (req, res) => {
  const userId = req.user.id;
  const { value, periods } = req.query; // nhận periods từ query

  try {
    let dateFilter = {};
    if (value) {
      const startDate = new Date(value + "-01");
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      dateFilter = { date: { $gte: startDate, $lt: endDate } };
    } else {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      dateFilter = { date: { $gte: twoMonthsAgo } };
    }

    // Truyền periods vào hàm dự đoán
    const result = await predictMonthlyExpense(
      userId,
      dateFilter,
      periods ? Number(periods) : 1
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
