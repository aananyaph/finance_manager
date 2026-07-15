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
    const {
      search,
      category,
      type,
      payment,
      sort,
      page,
      limit,
    } = req.query;

    const query = {
      user: req.user._id,
    };

    const searchTerm = search?.toString().trim();

    if (searchTerm) {
      query.$or = [
        { category: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (type && type !== "All") {
      query.type = type;
    }

    if (payment && payment !== "All") {
      query.paymentMethod = payment;
    }

    let sortOption = {};

    switch (sort) {
      case "newest":
        sortOption = { date: -1 };
        break;
      case "oldest":
        sortOption = { date: 1 };
        break;
      case "highest":
        sortOption = { amount: -1 };
        break;
      case "lowest":
        sortOption = { amount: 1 };
        break;
      case "category":
        sortOption = { category: 1 };
        break;
      default:
        sortOption = { date: -1 };
    }

    const currentPage = Number(page) || 1;
    const pageLimit = Number(limit) || 10;
    const skip = (currentPage - 1) * pageLimit;

    const totalTransactions = await Transaction.countDocuments(query);

    const transactions = await Transaction.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(pageLimit);

    const totalPages = Math.ceil(totalTransactions / pageLimit);

    return res.json({
      transactions,
      currentPage,
      totalPages,
      totalTransactions,
    });
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