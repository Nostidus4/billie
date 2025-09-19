const { Document, Settings, VectorStoreIndex, tool } = require("llamaindex");
const { OpenAIEmbedding } = require("@llamaindex/openai");
const { OpenAI } = require("openai");
const Expense = require("../models/Expense");
const Income = require("../models/Income");
const Goal = require("../models/Goal");
const { Types } = require("mongoose");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
});

const tools = [
    {
        type: "function",
        function: {
            name: "get_user_financial_data",
            description:
                "Get all information related to user's financial data.",
            parameters: {
                type: "object",
                properties: {},
            },
        },
    },
];

async function llm(messages, tools) {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        tools,
        tool_choice: "auto",
    });

    const message = completion.choices[0].message;
    if (!message) {
        throw new Error("No response from LLM");
    }

    return message;
}

async function callTool(tooCall, userId) {
    const toolName = tooCall.function.name;
    // const toolInput = JSON.parse(tooCall.function.arguments);

    switch (toolName) {
        case "get_user_financial_data": {
            const financialData = await loadUserFinancialData(userId);
            return JSON.stringify(financialData);
        }
        default:
            return `Unknown tool: ${toolName}`;
    }
}

async function runAgentLoop(userId, userInput) {
    let messages = [{ role: "user", content: userInput }];

    while (true) {
        const response = await llm(messages, tools);

        messages.push(response);

        if (response.tool_calls) {
            for (const toolCall of response.tool_calls) {
                if (toolCall.type !== "function") {
                    throw new Error("Unsupported tool call type");
                }

                const toolResponse = await callTool(toolCall, userId);
                messages.push({
                    role: "tool",
                    content: toolResponse,
                    tool_call_id: toolCall.id,
                });
            }
        } else {
            return response.content;
        }
    }
}

async function getAggregatedTotal(userId) {
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
}

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

module.exports = { loadUserExpenses, queryAgent, runAgentLoop };
