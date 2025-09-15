const { Document, Settings, VectorStoreIndex } = require("llamaindex");
const { MistralAI, MistralAIEmbedding } = require("@llamaindex/mistral");
const Expense = require("../models/Expense");
const Income = require("../models/Income");

Settings.llm = new MistralAI({
    apiKey: process.env.MISTRAL_API_KEY,
    model: "mistral-tiny",
});
Settings.embedModel = new MistralAIEmbedding();

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

async function loadUserFinancialData(userId) {
    const expenses = await loadUserExpenses(userId);
    const incomes = await loadUserIncomes(userId);
    return [...expenses, ...incomes];
}

async function createIndex(documents) {
    return VectorStoreIndex.fromDocuments(documents);
}

async function queryAgent(userId, question) {
    const documents = await loadUserFinancialData(userId);
    if (documents.length === 0) {
        return "No financial records (expenses or incomes) found.";
    }
    const index = await createIndex(documents);

    const retriever = index.asRetriever();

    const queryEngine = index.asQueryEngine({
        retriever,
        systemPrompt:
            "You are a financial advisor. Use the provided expense and income data to answer questions accurately, including calculations for totals, nets, or trends. Always reference specific dates, sources, and categories.",
    });

    // Or for an agent (handles complex queries)
    // const { ReActAgent } = require('@llamaindex/agent/react');
    // const agent = ReActAgent.fromTools([index.asTool()], { llm });
    // return await agent.chat(question);

    const response = await queryEngine.query({ query: question });
    return response.response;
}

module.exports = { loadUserExpenses, createIndex, queryAgent };
