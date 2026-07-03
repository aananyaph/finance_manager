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

// Update transaction
export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.json(updatedTransaction);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Delete transaction
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    await transaction.deleteOne();

    return res.json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};