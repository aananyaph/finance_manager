import express from "express";
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";

import Transaction from "../models/Transaction.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/*
========================================
IMPORT BANK STATEMENT
========================================
*/
router.post("/import", protect, async (req, res) => {
  try {
    const importedTransactions = req.body.map((t) => ({
      user: req.user._id,

      amount: Number(t.amount),

      type:
        t.type === "Income"
          ? "income"
          : "expense",

      category: t.category || "Others",

      description: t.description || "",

      paymentMethod: "UPI",

      date: t.date
        ? new Date(t.date)
        : new Date(),
    }));

    await Transaction.insertMany(importedTransactions);

    res.status(201).json({
      success: true,
      count: importedTransactions.length,
      message: "Transactions imported successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/*
========================================
NORMAL CRUD
========================================
*/

router
  .route("/")
  .post(protect, createTransaction)
  .get(protect, getTransactions);

router
  .route("/:id")
  .put(protect, updateTransaction)
  .delete(protect, deleteTransaction);

export default router;