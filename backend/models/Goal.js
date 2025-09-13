const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  title: {type: String, required: true},
  amount: {type: Number, required: true},
  currentAmount: {type: Number, default: 0},
  deadline: {type: Date},
  status: {type: String, enum: ["in-progress", "completed"], default: "in-progress"},
}, {timestamps: true});

module.exports = mongoose.model("Goal", GoalSchema);