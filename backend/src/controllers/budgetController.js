import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";

// Create budget
export const createBudget = async (req, res) => {
  try {
    const { category, limit, month, year } = req.body;

    if (!category || !limit || !month || !year) {
      return res.status(400).json({
        message: "All budget fields are required",
      });
    }

    const budget = await Budget.create({
      user: req.user._id,
      category,
      limit,
      month,
      year,
    });

    return res.status(201).json(budget);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "A budget already exists for this category and month",
      });
    }

    return res.status(500).json({
      message: error.message,
    });
  }
};

// Update budget
export const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    const { category, limit, month, year } = req.body;

    budget.category = category ?? budget.category;
    budget.limit = limit ?? budget.limit;
    budget.month = month ?? budget.month;
    budget.year = year ?? budget.year;

    const updatedBudget = await budget.save();

    return res.json(updatedBudget);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "A budget already exists for this category and month",
      });
    }

    return res.status(500).json({
      message: error.message,
    });
  }
};

// Delete budget
export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    await budget.deleteOne();

    return res.json({
      message: "Budget deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Get budgets with actual spending
export const getBudgets = async (req, res) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (!month || !year) {
      return res.status(400).json({
        message: "Month and year are required",
      });
    }

    const budgets = await Budget.find({
      user: req.user._id,
      month,
      year,
    }).sort({ createdAt: -1 });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const expenses = await Transaction.find({
          user: req.user._id,
          type: "expense",
          category: budget.category,
          date: {
            $gte: startDate,
            $lt: endDate,
          },
        });

        const spent = expenses.reduce(
          (total, transaction) =>
            total + transaction.amount,
          0
        );

        const percentage = Math.round(
          (spent / budget.limit) * 100
        );

        return {
          ...budget.toObject(),
          spent,
          remaining: budget.limit - spent,
          percentage,
          status:
            percentage >= 100
              ? "exceeded"
              : percentage >= 80
                ? "warning"
                : "safe",
        };
      })
    );

    return res.json(budgetsWithSpending);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};