const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const { verifyToken } = require("../middleware/auth");

// GET /api/rooms - Get all rooms
router.get("/", verifyToken, async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve rooms" });
  }
});

// POST /api/rooms - Create a new room (Admin only)
router.post("/", verifyToken, async (req, res) => {
  const { number, type, rent, capacity } = req.body;

  if (!number || !type || !rent || !capacity) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if room number already exists
    const existing = await Room.find({ number });
    if (existing.length > 0) {
      return res.status(400).json({ message: "Room number already exists" });
    }

    const room = await Room.create({
      number,
      type,
      rent: Number(rent),
      capacity: Number(capacity),
      currentOccupancy: 0,
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: "Failed to create room" });
  }
});

// PUT /api/rooms/:id - Update room details
router.put("/:id", verifyToken, async (req, res) => {
  const { type, rent, capacity } = req.body;
  try {
    const updated = await Room.findByIdAndUpdate(req.params.id, {
      type,
      rent: Number(rent),
      capacity: Number(capacity),
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update room" });
  }
});

// DELETE /api/rooms/:id - Delete room
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete room" });
  }
});

module.exports = router;
