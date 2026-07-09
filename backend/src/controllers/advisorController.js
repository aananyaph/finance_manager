import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import Goal from "../models/Goal.js";
import Investment from "../models/Investment.js";

export const getFinancialAdvice = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      transactions,
      budgets,
      goals,
      investments,
    ] = await Promise.all([
      Transaction.find({ user: userId }),
      Budget.find({ user: userId }),
      Goal.find({ user: userId }),
      Investment.find({ user: userId }),
    ]);

    const totalIncome = transactions
      .filter((item) => item.type === "income")
      .reduce(
        (total, item) => total + item.amount,
        0
      );

    const totalExpense = transactions
      .filter((item) => item.type === "expense")
      .reduce(
        (total, item) => total + item.amount,
        0
      );

    const savings = totalIncome - totalExpense;

    const savingsRate =
      totalIncome > 0
        ? (savings / totalIncome) * 100
        : 0;

    const advice = [];

    if (totalIncome === 0) {
      advice.push({
        type: "warning",
        title: "Add your income",
        message:
          "Add income transactions to receive more accurate financial insights.",
      });
    } else if (savingsRate >= 20) {
      advice.push({
        type: "success",
        title: "Strong savings rate",
        message: `You are saving ${savingsRate.toFixed(
          1
        )}% of your income.`,
      });
    } else if (savingsRate > 0) {
      advice.push({
        type: "warning",
        title: "Increase your savings",
        message: `Your savings rate is ${savingsRate.toFixed(
          1
        )}%. Try working toward at least 20%.`,
      });
    } else {
      advice.push({
        type: "danger",
        title: "Expenses exceed income",
        message:
          "Review your expenses and reduce non-essential spending.",
      });
    }

    const expenseCategories = {};

    transactions
      .filter((item) => item.type === "expense")
      .forEach((item) => {
        const category = item.category
          .trim()
          .toLowerCase()
          .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
          );

        expenseCategories[category] =
          (expenseCategories[category] || 0) +
          item.amount;
      });

    const highestCategory = Object.entries(
      expenseCategories
    ).sort((a, b) => b[1] - a[1])[0];

    if (highestCategory) {
      advice.push({
        type: "info",
        title: "Top spending category",
        message: `${highestCategory[0]} is your highest expense category at ₹${highestCategory[1].toLocaleString(
          "en-IN"
        )}.`,
      });
    }

    const activeGoals = goals.filter(
      (goal) => goal.status === "Active"
    );

    if (activeGoals.length > 0) {
      advice.push({
        type: "info",
        title: "Keep funding your goals",
        message: `You currently have ${activeGoals.length} active financial goal${
          activeGoals.length > 1 ? "s" : ""
        }.`,
      });
    }

    if (investments.length === 0) {
      advice.push({
        type: "info",
        title: "Build your investment portfolio",
        message:
          "You have not added any investments yet.",
      });
    } else {
      advice.push({
        type: "success",
        title: "Portfolio tracking active",
        message: `You are currently tracking ${investments.length} investment holding${
          investments.length > 1 ? "s" : ""
        }.`,
      });
    }

    return res.json({
      summary: {
        totalIncome,
        totalExpense,
        savings,
        savingsRate: Number(
          savingsRate.toFixed(2)
        ),
      },
      advice,
    });
  } catch (error) {
    console.error("ADVISOR ERROR:", error.message);

    return res.status(500).json({
      message: "Could not generate financial advice",
      error: error.message,
    });
  }
};