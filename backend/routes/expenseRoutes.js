const express = require("express");
const {
    addExpense,
    getAllExpense,
    deleteExpense,
    downloadExpenseExcel,
} = require("../controllers/expenseController.js");
const {
    queryAIExpenses,
    aiHealthCheck,
} = require("../controllers/aiExpenseController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/add", protect, addExpense);
router.get("/get", protect, getAllExpense);
router.delete("/:id", protect, deleteExpense);
router.get("/downloadexcel", protect, downloadExpenseExcel);

router.post("/ai/query", protect, queryAIExpenses);
router.get("/ai/health", protect, aiHealthCheck); // For testing AI service health

module.exports = router;

