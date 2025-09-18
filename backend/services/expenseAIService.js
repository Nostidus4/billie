const { Document, Settings, VectorStoreIndex } = require("llamaindex");
const { gemini, GeminiEmbedding, GEMINI_MODEL } = require("@llamaindex/google");
const Expense = require("../models/Expense");
const Income = require("../models/Income");
const Goal = require("../models/Goal");
const { Types } = require("mongoose");

Settings.llm = gemini({
    apiKey: process.env.GOOGLE_API_KEY,
    model: GEMINI_MODEL.GEMINI_2_0_FLASH,
});
Settings.embedModel = new GeminiEmbedding();

const getAggregatedTotal = async (userId) => {
    const userObjectId = new Types.ObjectId(String(userId));
    const totalIncome = await Income.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalExpense = await Expense.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return {
        totalIncome: totalIncome[0] ? totalIncome[0].total : 0,
        totalExpense: totalExpense[0] ? totalExpense[0].total : 0,
        netBalance:
            (totalIncome[0] ? totalIncome[0].total : 0) -
            (totalExpense[0] ? totalExpense[0].total : 0),
    };
};

async function loadUserIncomes(userId) {
    const incomes = await Income.find({ userId }).sort({ date: -1 });
    return incomes.map(
        (income) =>
            new Document({
                text: `Income on ${income.date.toDateString()}: Source - ${income.source}, Amount - $${income.amount}, Icon - ${income.icon || "N/A"}.`,
                metadata: {
                    id: income._id.toString(),
                    userId,
                    source: income.source,
                    amount: income.amount,
                    date: income.date.toISOString(),
                    type: "income",
                },
            }),
    );
}

async function loadUserExpenses(userId) {
    // Fetch all expenses for the user, sorted by date
    const expenses = await Expense.find({ userId }).sort({ date: -1 });

    // Convert to LlamaIndex Documents
    const documents = expenses.map(
        (expense) =>
            new Document({
                text: `Expense on ${expense.date.toDateString()}: Category - ${expense.category}, Amount - $${expense.amount}, Icon - ${expense.icon || "N/A"}.`,
                metadata: {
                    id: expense._id.toString(),
                    // userId: userId,
                    category: expense.category,
                    amount: expense.amount,
                    date: expense.date.toISOString(),
                    type: "expense",
                },
            }),
    );

    return documents;
}

async function loadUserGoals(userId) {
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });

    const documents = goals.map(
        (goals) =>
            new Document({
                text: `Goal: Title - ${goals.title}, Amount - $${goals.amount}, Current Amount - $${goals.currentAmount}, Status - ${goals.status}, Deadline - ${goals.deadline.toDateString()}.`,
                metadata: {
                    id: goals._id.toString(),
                    status: goals.status,
                    deadline: goals.deadline.toISOString(),
                    type: "goal",
                },
            }),
    );

    return documents;
}

async function loadUserFinancialData(userId) {
    const [expenses, incomes, goals, aggregatedTotals] = await Promise.all([
        loadUserExpenses(userId),
        loadUserIncomes(userId),
        loadUserGoals(userId),
        getAggregatedTotal(userId),
    ]);

    const summaryDocs = [
        new Document({
            text: `Financial Summary: Total Income - $${aggregatedTotals.totalIncome}, Total Expenses - $${aggregatedTotals.totalExpense}, Net Balance - $${aggregatedTotals.netBalance}.`,
            metadata: { type: "aggregate", userId, period: "all-time" },
        }),
    ];

    return [...expenses, ...incomes, ...goals, ...summaryDocs];
}

async function queryAgent(userId, question) {
    const documents = await loadUserFinancialData(userId);
    if (documents.length === 0) {
        return "No financial records (expenses or incomes) found.";
    }
    const index = await VectorStoreIndex.fromDocuments(documents);

    const retriever = index.asRetriever({ similarityTopK: 10 });

    const queryEngine = index.asQueryEngine({
        retriever,
        systemPrompt:
            "You are a financial advisor. Use the provided expense and income data to answer questions accurately, including calculations for totals, nets, or trends. Always reference specific dates, sources, and categories.",
    });

    const response = await queryEngine.query({ query: question });
    return response.response;
}

module.exports = { loadUserExpenses, queryAgent };
