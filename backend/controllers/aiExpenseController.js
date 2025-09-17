const { queryAgent } = require("../services/expenseAIService.js");
const Expense = require("../models/Expense");

exports.queryAIExpenses = async (req, res) => {
    try {
        const userId = req.user.id;
        const { question } = req.body; // e.g., { "question": "What did I spend on travel in August?" }

        if (!question) {
            return res.status(400).json({ message: "Question is required" });
        }

        const answer = await queryAgent(userId, question);
        res.status(200).json({ answer });
    } catch (error) {
        console.error("AI Query Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Optional: Health check endpoint for AI service
exports.aiHealthCheck = async (req, res) => {
    try {
        const userId = req.user.id;
        const expenses = await Expense.countDocuments({ user: userId });
        res.status(200).json({
            status: "healthy",
            expensesCount: expenses,
            aiConfigured: process.env.MISTRAL_API_KEY,
        });
    } catch (error) {
        res.status(500).json({ message: "Health check failed" });
    }
};
