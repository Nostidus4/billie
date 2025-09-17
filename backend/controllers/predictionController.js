const { spawn } = require('child_process');
const Expense = require('../models/Expense.js');
const Goal = require('../models/Goal.js');

// Get prediction data using Prophet model
exports.getPrediction = async (req, res) => {
  const userId = req.user.id;
  const { type, value } = req.query;
  
  try {
    let dateFilter = {};
    
    // Apply date filtering based on type
    if (type && value) {
      if (type === 'day') {
        const startDate = new Date(value);
        const endDate = new Date(value);
        endDate.setDate(endDate.getDate() + 1);
        dateFilter = { date: { $gte: startDate, $lt: endDate } };
      } else if (type === 'month') {
        const startDate = new Date(value + '-01');
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        dateFilter = { date: { $gte: startDate, $lt: endDate } };
      } else if (type === 'year') {
        const startDate = new Date(value + '-01-01');
        const endDate = new Date(value + '-12-31');
        endDate.setDate(endDate.getDate() + 1);
        dateFilter = { date: { $gte: startDate, $lt: endDate } };
      }
    } else {
      // Default: Get expense data for the last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      dateFilter = { date: { $gte: twelveMonthsAgo } };
    }
    
    const expenses = await Expense.find({
      userId,
      ...dateFilter
    }).sort({ date: 1 });

    if (expenses.length === 0) {
      return res.status(400).json({ 
        message: 'Insufficient data for prediction. Need at least some expense data.' 
      });
    }

    // Group expenses by month
    const monthlyData = {};
    expenses.forEach(expense => {
      const monthKey = expense.date.toISOString().substring(0, 7); // YYYY-MM format
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      monthlyData[monthKey] += expense.amount;
    });

    // Convert to Prophet format
    const prophetData = Object.entries(monthlyData).map(([month, amount]) => ({
      ds: `${month}-01`, // First day of the month
      y: amount
    }));

    // Check if we have enough data for prediction (at least 2 months)
    if (prophetData.length < 2) {
      return res.status(400).json({ 
        message: 'Insufficient data for prediction. Need at least 2 months of expense data.',
        chartData: Object.entries(monthlyData).map(([month, amount]) => ({
          month: month,
          amount: amount
        })),
        historicalData: Object.entries(monthlyData).map(([month, amount]) => ({
          month: month,
          amount: amount
        }))
      });
    }

    // Call Python script for prediction using virtual environment
    const python = spawn('./venv/bin/python', ['controllers/predict_prophet.py']);
    
    let predictionResult = '';
    let errorOutput = '';

    python.stdin.write(JSON.stringify(prophetData));
    python.stdin.end();

    python.stdout.on('data', (data) => {
      predictionResult += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', errorOutput);
        return res.status(500).json({ 
          message: 'Prediction failed. Please try again later.' 
        });
      }

      try {
        const prediction = JSON.parse(predictionResult);
        
        // Get historical data for chart
        const chartData = Object.entries(monthlyData).map(([month, amount]) => ({
          month: month,
          amount: amount
        }));

        // Add prediction to chart data
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const nextMonthKey = nextMonth.toISOString().substring(0, 7);
        
        chartData.push({
          month: nextMonthKey,
          amount: prediction.prediction
        });

        res.status(200).json({
          prediction: prediction.prediction,
          chartData: chartData,
          historicalData: Object.entries(monthlyData).map(([month, amount]) => ({
            month: month,
            amount: amount
          }))
        });
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        res.status(500).json({ 
          message: 'Failed to parse prediction result.' 
        });
      }
    });

  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get goals for the user
exports.getGoals = async (req, res) => {
  const userId = req.user.id;
  try {
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
