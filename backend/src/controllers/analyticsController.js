import Transaction from "../models/Transaction.js";

export const getAnalytics = async (req, res) => {
  try {
    const year = Number(req.query.year);

    if (!year) {
      return res.status(400).json({
        message: "Year is required",
      });
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const transactions = await Transaction.find({
      user: req.user._id,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    const monthlyData = Array.from(
      { length: 12 },
      (_, index) => ({
        month: new Date(2000, index, 1).toLocaleString(
          "en-US",
          {
            month: "short",
          }
        ),
        income: 0,
        expense: 0,
      })
    );

    const categoryMap = {};

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount);

      const transactionMonth =
        new Date(transaction.date).getMonth();

      if (transaction.type === "income") {
        totalIncome += amount;

        monthlyData[transactionMonth].income += amount;
      }

      if (transaction.type === "expense") {
        totalExpense += amount;

        monthlyData[transactionMonth].expense += amount;

        const normalizedCategory =
  transaction.category
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

categoryMap[normalizedCategory] =
  (categoryMap[normalizedCategory] || 0) +
  amount;
      }
    });

    const categoryBreakdown = Object.entries(
      categoryMap
    )
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);

    const savings = totalIncome - totalExpense;

    const savingsRate =
      totalIncome > 0
        ? (savings / totalIncome) * 100
        : 0;

    const highestExpenseCategory =
      categoryBreakdown.length > 0
        ? categoryBreakdown[0]
        : null;

    return res.json({
      year,

      summary: {
        totalIncome,
        totalExpense,
        savings,
        savingsRate: Number(savingsRate.toFixed(2)),
        transactionCount: transactions.length,
      },

      monthlyData,

      categoryBreakdown,

      highestExpenseCategory,
    });
  } catch (error) {
    console.error("ANALYTICS ERROR:", error.message);

    return res.status(500).json({
      message: "Could not load analytics",
      error: error.message,
    });
  }
};