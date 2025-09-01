
const xlxs = require('xlsx');
const Income = require('../models/Income.js');
const { writeXLSX } = require('xlsx');

//  Add Income Source
exports.addIncome = async (req, res) => {
  const userId = req.user.id;

  try {
    const { icon, source, amount, date } = req.body;

    // Validate required fields
    if (!source || !amount || !date) {
      return res.status(400).json({ message: 'All fields are required' });
    };

    const newIncome = new Income({
      userId,
      icon,
      source,
      amount,
      date: new Date(date),
    });


    //second method: date=Date.now() as default in model
    // if (!source || !amount) {
    //   return res.status(400).json({ message: 'Source and Amount are required' });
    // };

    // const newIncome = new Income({
    //   userID: userId,
    //   icon,
    //   source,
    //   amount,
    //   date: date ? new Date(date) : Date.now(),
    // });

    await newIncome.save();
    res.status(201).json(newIncome);
  } catch (error) {
    res.status(500).json({ message: 'Server Error'});
  }
};

//  Get All Income Source
exports.getAllIncome = async (req, res) => {
  const userId = req.user.id;

  try {
    const incomes = await Income.find({ userId }).sort({ date: -1 });
    res.status(200).json(incomes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  };
};

//  Delete Income Source
exports.deleteIncome = async (req, res) => {
  try {
    await Income.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Income deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  };
};

//  Download Excel
exports.downloadIncomeExcel = async (req, res) => {
  const userId = req.user.id;
  try {
    const income = await Income.find({ userId }).sort({ date: -1 });

    //Prepare data for Excel
    const data = income.map((item) =>({
      Source: item.source,
      Amount: item.amount,
      Date: item.date,
    }));

    const wb = xlxs.utils.book_new();
    const ws = xlxs.utils.json_to_sheet(data);
    xlxs.utils.book_append_sheet(wb, ws, "Incomes");
    xlxs.writeFile(wb, "income_details.xlsx");
    res.download("income_details.xlsx");
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};