const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const Tenant = require("../models/Tenant");
const { verifyToken } = require("../middleware/auth");

// GET /api/feedback - Retrieve all feedbacks (Admin only)
router.get("/", verifyToken, async (req, res) => {
  try {
    const list = await Feedback.find({});

    // Calculate averages for categories to show on Admin Dashboard
    if (list.length === 0) {
      return res.json({
        feedbacks: [],
        averages: { food: 0, wifi: 0, cleanliness: 0, overall: 0 },
      });
    }

    let foodSum = 0;
    let wifiSum = 0;
    let cleanSum = 0;
    let overallSum = 0;

    list.forEach((fb) => {
      foodSum += fb.foodRating || 0;
      wifiSum += fb.wifiRating || 0;
      cleanSum += fb.cleanlinessRating || 0;
      overallSum += fb.overallRating || 0;
    });

    res.json({
      feedbacks: list,
      averages: {
        food: (foodSum / list.length).toFixed(1),
        wifi: (wifiSum / list.length).toFixed(1),
        cleanliness: (cleanSum / list.length).toFixed(1),
        overall: (overallSum / list.length).toFixed(1),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve feedback reviews" });
  }
});

// POST /api/feedback - Submit weekly feedback (Tenant)
router.post("/", verifyToken, async (req, res) => {
  const {
    tenantId,
    foodRating,
    wifiRating,
    cleanlinessRating,
    overallRating,
    comments,
  } = req.body;

  if (
    !tenantId ||
    !foodRating ||
    !wifiRating ||
    !cleanlinessRating ||
    !overallRating
  ) {
    return res
      .status(400)
      .json({ message: "All ratings (1 to 5) are required" });
  }

  try {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant profile not found" });
    }

    const feedback = await Feedback.create({
      tenantName: tenant.name,
      roomNumber: tenant.roomNumber,
      foodRating: Number(foodRating),
      wifiRating: Number(wifiRating),
      cleanlinessRating: Number(cleanlinessRating),
      overallRating: Number(overallRating),
      comments: comments || "",
      submittedDate: new Date(),
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error("Feedback submit error:", error);
    res.status(500).json({ message: "Failed to submit weekly feedback" });
  }
});

module.exports = router;
