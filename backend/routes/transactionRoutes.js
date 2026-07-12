const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");

// Import many transactions
router.post("/import", async (req, res) => {
  try {
    const transactions = req.body;

    await Transaction.insertMany(transactions);

    res.json({
      success: true,
      count: transactions.length,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Import failed",
    });
  }
});

// Get all transactions
router.get("/", async (req, res) => {
  const data = await Transaction.find().sort({
    createdAt: -1,
  });

  res.json(data);
});

module.exports = router;