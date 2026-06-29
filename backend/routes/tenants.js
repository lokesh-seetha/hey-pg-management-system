const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");

const Tenant = require("../models/Tenant");
const Room = require("../models/Room");
const User = require("../models/User");

const { verifyToken } = require("../middleware/auth");
// GET /api/tenants
router.get("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can view tenants",
      });
    }

    const tenants = await Tenant.find({});
    res.json(tenants);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve tenants",
    });
  }
});

// GET /api/tenants/me - Logged-in tenant profile
router.get("/me", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "tenant") {
      return res.status(403).json({
        message: "Only tenants can access this endpoint",
      });
    }

    const tenant = await Tenant.findById(req.user.tenantId);

    if (!tenant) {
      return res.status(404).json({
        message: "Tenant profile not found",
      });
    }

    res.json(tenant);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch tenant profile",
    });
  }
});
// POST /api/tenants - Create Tenant (Admin only)
router.post("/", verifyToken, async (req, res) => {
  const {
    name,
    phone,
    email,
    emergencyContact,
    roomId,
    joinDate,
    rentPlan,
    rentAmount,
    username,
    password,
  } = req.body;

  if (
    !name ||
    !phone ||
    !email ||
    !emergencyContact ||
    !roomId ||
    !joinDate ||
    !rentPlan ||
    !rentAmount ||
    !username ||
    !password
  ) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    // Only admin can create tenants
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can create tenants",
      });
    }

    // Check if username already exists
    const existingUser = await User.find({
      username: username.toLowerCase(),
    });

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "Username already exists",
      });
    }

    // Check room
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    if (room.currentOccupancy >= room.capacity) {
      return res.status(400).json({
        message: "Room is full",
      });
    }

    // Calculate due date
    const join = new Date(joinDate);
    const due = new Date(joinDate);

    if (rentPlan === "Monthly") {
      due.setDate(join.getDate() + 30);
    } else if (rentPlan === "6-Months") {
      due.setDate(join.getDate() + 180);
    } else if (rentPlan === "Yearly") {
      due.setDate(join.getDate() + 365);
    }

    // Create tenant
    const tenant = await Tenant.create({
      name,
      phone,
      email,
      emergencyContact,
      roomId,
      roomNumber: room.number,
      joinDate,
      rentPlan,
      rentAmount: Number(rentAmount),
      rentStatus: "Unpaid",
      dueDate: due.toISOString().split("T")[0],
      username: username.toLowerCase(),
      status: "Active",
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create login
    await User.create({
      username: username.toLowerCase(),
      password: hashedPassword,
      role: "tenant",
      name,
      tenantId: tenant.id || tenant._id,
    });

    // Increase room occupancy
    await Room.findByIdAndUpdate(roomId, {
      currentOccupancy: room.currentOccupancy + 1,
    });

    res.status(201).json({
      message: "Tenant created successfully",
      tenant,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create tenant",
    });
  }
});
// PUT /api/tenants/:id - Update Tenant (Admin only)
router.put("/:id", verifyToken, async (req, res) => {
  const { name, phone, email, emergencyContact, rentStatus, dueDate } =
    req.body;

  try {
    // Only admin can update tenants
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can update tenants",
      });
    }

    const updatedTenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      {
        name,
        phone,
        email,
        emergencyContact,
        rentStatus,
        dueDate,
      },
      { new: true },
    );

    if (!updatedTenant) {
      return res.status(404).json({
        message: "Tenant not found",
      });
    }

    res.json(updatedTenant);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update tenant",
    });
  }
});
// POST /api/tenants/:id/checkout - Checkout Tenant (Admin only)
router.post("/:id/checkout", verifyToken, async (req, res) => {
  try {
    // Only admin can checkout tenants
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can checkout tenants",
      });
    }

    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({
        message: "Tenant not found",
      });
    }

    if (tenant.status === "Inactive") {
      return res.status(400).json({
        message: "Tenant is already checked out",
      });
    }

    // Release room occupancy
    const room = await Room.findById(tenant.roomId);

    if (room && room.currentOccupancy > 0) {
      await Room.findByIdAndUpdate(tenant.roomId, {
        currentOccupancy: Math.max(0, room.currentOccupancy - 1),
      });
    }

    // Update tenant status
    const updatedTenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      {
        status: "Inactive",
        roomId: "checked-out",
        roomNumber: "None",
      },
      { new: true },
    );

    // Delete tenant login account
    const users = await User.find({
      tenantId: req.params.id,
    });

    if (users.length > 0) {
      await User.findByIdAndDelete(users[0].id || users[0]._id);
    }

    res.json({
      message: "Tenant checked out successfully",
      tenant: updatedTenant,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to checkout tenant",
    });
  }
});

module.exports = router;
