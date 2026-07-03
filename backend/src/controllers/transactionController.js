import Transaction from "../models/Transaction.js";

// Add transaction
export const createTransaction = async (req, res) => {
  try {
    const {
      type,
      amount,
      category,
      description,
      paymentMethod,
      date,
    } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({
        message: "Type, amount and category are required",
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount,
      category,
      description,
      paymentMethod,
      date,
    });

    return res.status(201).json(transaction);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Get logged-in user's transactions
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id,
    }).sort({ date: -1 });

    return res.json(transactions);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};