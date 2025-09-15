
const xlsx = require('xlsx');
const Goal = require('../models/Goal.js');

//  Add Goal
exports.addGoal = async (req, res) => {
  const userId = req.user.id;
  try {
    const { title, amount, deadline } = req.body;
    if (!title || !amount || !deadline) {
      return res.status(400).json({ message: 'All field are required' });
    }
    const newGoal = new Goal({
      userId,
      title,
      amount,
      deadline: deadline ? new Date(deadline) : undefined
    });
    await newGoal.save();
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({ message: 'Server Error'});
  }
};

//  Get All Goals
exports.getAllGoal = async (req, res) => {
  const userId = req.user.id;
  try {
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

//  Delete Goal
exports.deleteGoal = async (req, res) => {
  try {
    await Goal.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update currentAmount by increment and set status if completed
exports.updateGoalCurAmount = async (req, res) => {
  const { id } = req.params;
  const { increment } = req.body;
  if (typeof increment !== 'number') {
    return res.status(400).json({ message: 'Increment value must be a number' });
  }
  try {
    const goal = await Goal.findById(id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    let newAmount = goal.currentAmount + increment;
    if (newAmount < 0) newAmount = 0;
    let newStatus = goal.status;

    if (newAmount >= goal.amount) {
      newStatus = 'completed';
    } else {
      newStatus = 'in-progress';
    }
    
    goal.currentAmount = newAmount;
    goal.status = newStatus;
    await goal.save();
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};


//  Download Goals Excel
exports.downloadGoalExcel = async (req, res) => {
  const userId = req.user.id;
  try {
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
    // Prepare data for Excel
    const data = goals.map((item) => ({
      Title: item.title,
      Amount: item.amount,
      CurrentAmount: item.currentAmount,
      Deadline: item.deadline,
      Status: item.status,
      CreatedAt: item.createdAt
    }));
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Goals");
    xlsx.writeFile(wb, "goal_details.xlsx");
    res.download("goal_details.xlsx");
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};