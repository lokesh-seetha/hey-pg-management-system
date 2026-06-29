const express = require("express");
const router = express.Router();
const Grievance = require("../models/Grievance");
const Tenant = require("../models/Tenant");
const { verifyToken } = require("../middleware/auth");

// GET /api/grievances - Get all grievances
router.get("/", verifyToken, async (req, res) => {
  try {
    const list = await Grievance.find({});
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve grievances" });
  }
});

// POST /api/grievances - Submit a grievance (Tenant)
router.post("/", verifyToken, async (req, res) => {
  const { tenantId, category, description } = req.body;

  if (!tenantId || !category || !description) {
    return res
      .status(400)
      .json({ message: "Category and description are required" });
  }

  try {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant profile not found" });
    }

    const grievance = await Grievance.create({
      tenantId,
      tenantName: tenant.name,
      roomNumber: tenant.roomNumber,
      category,
      description,
      status: "Pending",
    });

    res.status(201).json(grievance);
  } catch (error) {
    console.error("Grievance submission error:", error);
    res.status(500).json({ message: "Failed to submit grievance" });
  }
});

// PUT /api/grievances/:id - Update grievance status (Admin/Owner)
router.put("/:id", verifyToken, async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const updated = await Grievance.findByIdAndUpdate(req.params.id, {
      status,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update grievance status" });
  }
});

module.exports = router;
