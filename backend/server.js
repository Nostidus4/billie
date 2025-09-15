require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path=require("path");
const connectDB=require("./config/db.js");
const authRoutes=require("./routes/authRoutes.js");
const incomeRoutes=require("./routes/incomeRoutes.js");
const expenseRoutes=require("./routes/expenseRoutes.js");
const dashboardRoutes=require("./routes/dashboardRoutes.js");
const goalRoutes=require("./routes/goalRoutes.js");

const app = express();

// Middleware to handle CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    optionsSuccessStatus: 204,
  })
);
// Note: No explicit app.options here; CORS middleware above will handle preflight
app.use(express.json());

connectDB();

app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/income",incomeRoutes);
app.use("/api/v1/expense",expenseRoutes);
app.use("/api/v1/dashboard",dashboardRoutes);
app.use("/api/v1/goal",goalRoutes);

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>{console.log(`Server running on port ${PORT}`)});