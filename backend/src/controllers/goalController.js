import Goal from "../models/Goal.js";

// Add calculated fields to a goal
const calculateGoal = (goal) => {
  const goalObject = goal.toObject();

  const progress =
    goal.targetAmount > 0
      ? (goal.savedAmount / goal.targetAmount) * 100
      : 0;

  const remaining = Math.max(
    goal.targetAmount - goal.savedAmount,
    0
  );

  const today = new Date();
  const deadline = new Date(goal.deadline);

  const daysLeft = Math.ceil(
    (deadline - today) / (1000 * 60 * 60 * 24)
  );

  return {
    ...goalObject,
    progress: Number(Math.min(progress, 100).toFixed(2)),
    remaining,
    daysLeft,
  };
};

// Create goal
export const createGoal = async (req, res) => {
  try {
    const {
      name,
      targetAmount,
      savedAmount,
      deadline,
      category,
    } = req.body;

    if (!name || !targetAmount || !deadline) {
      return res.status(400).json({
        message: "Name, target amount, and deadline are required",
      });
    }

    const goal = await Goal.create({
      user: req.user._id,
      name,
      targetAmount,
      savedAmount: savedAmount || 0,
      deadline,
      category,
    });

    return res.status(201).json(calculateGoal(goal));
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Get all goals
export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    return res.json(goals.map(calculateGoal));
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Update goal
export const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    const allowedFields = [
      "name",
      "targetAmount",
      "savedAmount",
      "deadline",
      "category",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        goal[field] = req.body[field];
      }
    });

    goal.status =
      goal.savedAmount >= goal.targetAmount
        ? "Completed"
        : "Active";

    const updatedGoal = await goal.save();

    return res.json(calculateGoal(updatedGoal));
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Add money to a goal
export const addContribution = async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Enter a valid contribution amount",
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    goal.savedAmount += amount;

    goal.status =
      goal.savedAmount >= goal.targetAmount
        ? "Completed"
        : "Active";

    const updatedGoal = await goal.save();

    return res.json(calculateGoal(updatedGoal));
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Delete goal
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    await goal.deleteOne();

    return res.json({
      message: "Goal deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};