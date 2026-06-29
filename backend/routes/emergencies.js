const express = require("express");
const router = express.Router();
const EmergencyAlert = require("../models/EmergencyAlert");
const Tenant = require("../models/Tenant");
const { verifyToken } = require("../middleware/auth");

// GET /api/emergencies - Fetch all emergency logs
router.get("/", verifyToken, async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({});
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve emergencies" });
  }
});

// POST /api/emergencies - Trigger an SOS alert (Tenant)
router.post("/", verifyToken, async (req, res) => {
  const { tenantId, message } = req.body;

  if (!tenantId) {
    return res.status(400).json({ message: "Tenant ID is required for SOS" });
  }

  try {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant profile not found" });
    }

    const alert = await EmergencyAlert.create({
      tenantName: tenant.name,
      roomNumber: tenant.roomNumber,
      phone: tenant.phone,
      message: message || "🚨 CRITICAL MEDICAL EMERGENCY SOS TRIGGERED! 🚨",
      status: "Active",
    });

    res.status(201).json(alert);
  } catch (error) {
    console.error("SOS trigger error:", error);
    res.status(500).json({ message: "Failed to broadcast SOS alert" });
  }
});

// PUT /api/emergencies/:id - Resolve SOS alert (Admin)
router.put("/:id", verifyToken, async (req, res) => {
  const { status } = req.body;
  try {
    const updated = await EmergencyAlert.findByIdAndUpdate(req.params.id, {
      status: status || "Resolved",
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update SOS status" });
  }
});

module.exports = router;
