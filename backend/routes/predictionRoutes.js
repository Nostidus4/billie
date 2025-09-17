const express = require("express");
const {
  getPrediction,
  getGoals
} = require("../controllers/predictionController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.get("/prediction", protect, getPrediction);
router.get("/goals", protect, getGoals);

module.exports = router;
