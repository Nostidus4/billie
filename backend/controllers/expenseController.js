const xlsx = require("xlsx");
const Expense = require("../models/Expense.js");

//  Add Expense Source
exports.addExpense = async (req, res) => {
  const userId = req.user.id;

  try {
    const { icon, category, amount, date } = req.body;

    // Validate required fields
    if (!category || !amount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newExpense = new Expense({
      userId,
      icon,
      category,
      amount,
      date: new Date(date),
    });

    //second method: date=Date.now() as default in model
    // if (!category || !amount) {
    //   return res.status(400).json({ message: 'Source and Amount are required' });
    // };

    // const newExpense = new Expense({
    //   userID: userId,
    //   icon,
    //   category,
    //   amount,
    //   date: date ? new Date(date) : Date.now(),
    // });

    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

//  Get All Expense Source
exports.getAllExpense = async (req, res) => {
  const userId = req.user.id;

  try {
    const expenses = await Expense.find({ userId }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

//  Delete Expense Source
exports.deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

//  Download Excel
exports.downloadExpenseExcel = async (req, res) => {
  const userId = req.user.id;
  try {
    const expense = await Expense.find({ userId }).sort({ date: -1 });

    //Prepare data for Excel
    const data = expense.map((item) => ({
      Category: item.category,
      Amount: item.amount,
      Date: item.date,
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Expenses");
    xlsx.writeFile(wb, "expense_details.xlsx");
    res.download("expense_details.xlsx");
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.predictExpense = async (req, res) => {
  const userId = req.user.id;
  try {
    const expenses = await Expense.find({ userId }).sort({ date: 1 });

    if (expenses.length === 0) {
      return res
        .status(200)
        .json({ ma: 0, prophet: 0, message: "No expense data to predict." });
    }

    const monthlyTotals = {};
    expenses.forEach((exp) => {
      const month = exp.date.getFullYear() + "-" + (exp.date.getMonth() + 1);
      if (!monthlyTotals[month]) monthlyTotals[month] = 0;
      monthlyTotals[month] += exp.amount;
    });

    const monthlyAmounts = Object.values(monthlyTotals);

    // Moving Average (MA)
    let ma = 0;
    if (monthlyAmounts.length >= 3) {
      ma = monthlyAmounts.slice(-3).reduce((a, b) => a + b, 0) / 3;
    } else {
      ma = monthlyAmounts.reduce((a, b) => a + b, 0) / monthlyAmounts.length;
    }

    const prophetData = Object.entries(monthlyTotals).map(
      ([month, amount]) => ({
        ds: month + "-01",
        y: amount,
      })
    );

    const py = spawn("python", ["predict_prophet.py"]);
    let prophetResult = "";
    py.stdin.write(JSON.stringify(prophetData));
    py.stdin.end();

    py.stdout.on("data", (data) => {
      prophetResult += data.toString();
    });

    py.stderr.on("data", (data) => {
      console.error("Prophet error:", data.toString());
    });
    py.on("close", (code) => {
      let prophetPrediction = 0;
      try {
        prophetPrediction = JSON.parse(prophetResult).prediction;
      } catch (e) {
        prophetPrediction = 0;
      }
      res.status(200).json({ ma, prophet: prophetPrediction });
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getMonthlyComparison = async (req, res) => {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthTotal = await Expense.aggregate([
      {
        $match: {
          userId: req.user.id,
          date: { $gte: thisMonthStart, $lte: now },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const lastMonthTotal = await Expense.aggregate([
      {
        $match: {
          userId: req.user.id,
          date: { $gte: lastMonthStart, $lte: lastMonthEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const current = thisMonthTotal[0]?.total || 0;
    const previous = lastMonthTotal[0]?.total || 0;
    const difference = current - previous;
    const percent = previous === 0 ? 0 : (difference / previous) * 100;

    res.json({ current, previous, difference, percent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMonthlyCategoryTotal = async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totals = await Expense.aggregate([
      {
        $match: {
          userId: req.user.id,
          date: { $gte: monthStart, $lte: now },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          total: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json(totals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategoryPercentThisMonth = async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = await Expense.aggregate([
      {
        $match: {
          userId: req.user.id,
          date: { $gte: monthStart, $lte: now },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: null,
          categories: { $push: { category: "$_id", total: "$total" } },
          grandTotal: { $sum: "$total" },
        },
      },
      { $unwind: "$categories" },
      {
        $project: {
          _id: 0,
          category: "$categories.category",
          total: "$categories.total",
          percent: {
            $multiply: [{ $divide: ["$categories.total", "$grandTotal"] }, 100],
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
