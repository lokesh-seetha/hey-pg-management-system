const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const Tenant = require("../models/Tenant");
const { verifyToken } = require("../middleware/auth");

// GET /api/payments - Get all rent payment histories
router.get("/", verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find({});
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve payments" });
  }
});

// POST /api/payments - Record a payment & update tenant due status (Admin only)
router.post("/", verifyToken, async (req, res) => {
  const { tenantId, amount, date, mode, plan, transactionId, monthYear } =
    req.body;

  if (!tenantId || !amount || !date || !mode || !plan || !monthYear) {
    return res.status(400).json({ message: "Required details are missing" });
  }

  try {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant profile not found" });
    }

    // 1. Log payment in payments collection
    const payment = await Payment.create({
      tenantId,
      tenantName: tenant.name,
      amount: Number(amount),
      date,
      mode,
      plan,
      transactionId: transactionId || "N/A",
      monthYear,
    });

    // 2. Calculate next rent due date based on plan starting from the current due date (or current date if it was way past due)
    const currentDueObj = new Date(tenant.dueDate);
    let nextDueObj = new Date(currentDueObj);

    // Fallback if current due date is invalid or empty
    if (isNaN(nextDueObj.getTime())) {
      nextDueObj = new Date();
    }

    if (plan === "Monthly") {
      nextDueObj.setDate(nextDueObj.getDate() + 30);
    } else if (plan === "6-Months") {
      nextDueObj.setDate(nextDueObj.getDate() + 180);
    } else if (plan === "Yearly") {
      nextDueObj.setDate(nextDueObj.getDate() + 365);
    }
    const nextDueStr = nextDueObj.toISOString().split("T")[0];

    // 3. Update tenant rent status to 'Paid' and advance their due date
    await Tenant.findByIdAndUpdate(tenantId, {
      rentStatus: "Paid",
      dueDate: nextDueStr,
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error("Payment log error:", error);
    res.status(500).json({ message: "Failed to log rent payment" });
  }
});

module.exports = router;
