const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Tenant = require("../models/Tenant");
const { verifyToken } = require("../middleware/auth");

// GET /api/attendance/today - Get meal attendance summary and details for today
router.get("/today", verifyToken, async (req, res) => {
  const today = req.query.date || new Date().toISOString().split("T")[0];

  try {
    const list = await Attendance.find({ date: today });
    const activeTenants = await Tenant.find({ status: "Active" });
    const totalCount = activeTenants.length;

    // Calculate aggregated headcount of who is eating
    // (If no attendance record exists, default to true i.e. eating at PG)
    let breakfastEating = 0;
    let lunchEating = 0;
    let dinnerEating = 0;

    activeTenants.forEach((tenant) => {
      const record = list.find(
        (att) =>
          att.tenantId === tenant.id || att.tenantId === tenant._id.toString(),
      );
      if (record) {
        if (record.breakfast) breakfastEating++;
        if (record.lunch) lunchEating++;
        if (record.dinner) dinnerEating++;
      } else {
        // No log means tenant is present by default
        breakfastEating++;
        lunchEating++;
        dinnerEating++;
      }
    });

    res.json({
      date: today,
      summary: {
        total: totalCount,
        breakfast: {
          eating: breakfastEating,
          leave: totalCount - breakfastEating,
        },
        lunch: { eating: lunchEating, leave: totalCount - lunchEating },
        dinner: { eating: dinnerEating, leave: totalCount - dinnerEating },
      },
      records: list,
    });
  } catch (error) {
    console.error("Attendance fetch error:", error);
    res.status(500).json({ message: "Failed to fetch meal attendance data" });
  }
});

// GET /api/attendance/tenant/:tenantId - Get a specific tenant's record for a date
router.get("/tenant/:tenantId", async (req, res) => {
  const today = req.query.date || new Date().toISOString().split("T")[0];
  try {
    const records = await Attendance.find({
      tenantId: req.params.tenantId,
      date: today,
    });
    if (records.length > 0) {
      return res.json(records[0]);
    }
    // Default model values if no record exists yet
    res.json({
      tenantId: req.params.tenantId,
      date: today,
      breakfast: true,
      lunch: true,
      dinner: true,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve tenant attendance status" });
  }
});

// POST /api/attendance - Toggle meal leave status (Tenant)
router.post("/", verifyToken, async (req, res) => {
  const { tenantId, date, breakfast, lunch, dinner } = req.body;

  if (!tenantId || !date) {
    return res.status(400).json({ message: "Tenant ID and Date are required" });
  }

  try {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant profile not found" });
    }

    // Find and update or create a new attendance log (Upsert)
    const updated = await Attendance.findOneAndUpdate(
      { tenantId, date },
      {
        tenantName: tenant.name,
        roomNumber: tenant.roomNumber,
        breakfast: breakfast !== undefined ? breakfast : true,
        lunch: lunch !== undefined ? lunch : true,
        dinner: dinner !== undefined ? dinner : true,
      },
      { new: true, upsert: true },
    );

    res.json(updated);
  } catch (error) {
    console.error("Save attendance error:", error);
    res.status(500).json({ message: "Failed to record attendance status" });
  }
});

module.exports = router;
