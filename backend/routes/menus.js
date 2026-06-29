const express = require("express");
const router = express.Router();
const Menu = require("../models/Menu");
const { verifyToken } = require("../middleware/auth");

// GET /api/menu - Get current weekly menu timetable
router.get("/", verifyToken, async (req, res) => {
  try {
    let menu = await Menu.findOne({});
    // If no menu exists in DB, return empty object
    if (!menu) {
      menu = {
        Monday: { breakfast: "", lunch: "", dinner: "" },
        Tuesday: { breakfast: "", lunch: "", dinner: "" },
        Wednesday: { breakfast: "", lunch: "", dinner: "" },
        Thursday: { breakfast: "", lunch: "", dinner: "" },
        Friday: { breakfast: "", lunch: "", dinner: "" },
        Saturday: { breakfast: "", lunch: "", dinner: "" },
        Sunday: { breakfast: "", lunch: "", dinner: "" },
      };
    }
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve food menu" });
  }
});

// PUT /api/menu - Update weekly menu timetable (Admin only)
router.put("/", verifyToken, async (req, res) => {
  try {
    // Updates the menu fields (Monday-Sunday)
    const updated = await Menu.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
    });
    res.json(updated);
  } catch (error) {
    console.error("Menu update error:", error);
    res.status(500).json({ message: "Failed to update food menu" });
  }
});

module.exports = router;
