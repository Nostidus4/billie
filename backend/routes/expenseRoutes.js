const express = require("express");
const {
  addExpense,
  getAllExpense,
  deleteExpense,
  downloadExpenseExcel,
  predictExpense,
  getMonthlyComparison,
  getMonthlyCategoryTotal,
  getCategoryPercentThisMonth,
} = require("../controllers/expenseController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/add", protect, addExpense);
router.get("/get", protect, getAllExpense);
router.delete("/:id", protect, deleteExpense);
router.get("/downloadexcel", protect, downloadExpenseExcel);
router.get("/predict", protect, predictExpense);
router.get("/monthly-comparison", protect, getMonthlyComparison);
router.get("/monthly-category-total", protect, getMonthlyCategoryTotal);
router.get("/category-percent", protect, getCategoryPercentThisMonth);
module.exports = router;
