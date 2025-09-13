const express = require("express");
const {
  addGoal,
  getAllGoal,
  deleteGoal,
  downloadGoalExcel,
  updateGoalCurAmount,
} = require("../controllers/goalController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/add", protect, addGoal);
router.get("/get", protect, getAllGoal);
router.delete("/:id", protect, deleteGoal);
router.get("/downloadexcel", protect, downloadGoalExcel);
router.patch("/update-cur-amount/:id", protect, updateGoalCurAmount);

module.exports = router;