import Investment from "../models/Investment.js";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

// Helper function to calculate investment values
const calculateInvestment = (investment) => {
  const investedValue =
    investment.quantity * investment.averageBuyPrice;

  const currentValue =
    investment.quantity * investment.currentPrice;

  const profitLoss = currentValue - investedValue;

  const returnPercentage =
    investedValue > 0
      ? (profitLoss / investedValue) * 100
      : 0;

  return {
    ...investment.toObject(),
    investedValue,
    currentValue,
    profitLoss,
    returnPercentage: Number(returnPercentage.toFixed(2)),
  };
};

// Create investment
export const createInvestment = async (req, res) => {
  try {
    const {
      assetType,
      name,
      symbol,
      quantity,
      averageBuyPrice,
      currentPrice,
      purchaseDate,
    } = req.body;

    if (
      !assetType ||
      !name ||
      quantity === undefined ||
      averageBuyPrice === undefined ||
      currentPrice === undefined
    ) {
      return res.status(400).json({
        message: "Please fill all required investment fields",
      });
    }

    const investment = await Investment.create({
      user: req.user._id,
      assetType,
      name,
      symbol,
      quantity,
      averageBuyPrice,
      currentPrice,
      purchaseDate,
    });

    return res.status(201).json(
      calculateInvestment(investment)
    );
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Get all investments
export const getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    const calculatedInvestments = investments.map(
      calculateInvestment
    );

    return res.json(calculatedInvestments);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Get portfolio summary
export const getPortfolioSummary = async (req, res) => {
  try {
    const investments = await Investment.find({
      user: req.user._id,
    });

    let totalInvested = 0;
    let totalCurrentValue = 0;

    investments.forEach((investment) => {
      totalInvested +=
        investment.quantity *
        investment.averageBuyPrice;

      totalCurrentValue +=
        investment.quantity *
        investment.currentPrice;
    });

    const totalProfitLoss =
      totalCurrentValue - totalInvested;

    const totalReturnPercentage =
      totalInvested > 0
        ? (totalProfitLoss / totalInvested) * 100
        : 0;

    return res.json({
      totalInvested,
      totalCurrentValue,
      totalProfitLoss,
      totalReturnPercentage: Number(
        totalReturnPercentage.toFixed(2)
      ),
      totalHoldings: investments.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Update investment
export const updateInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!investment) {
      return res.status(404).json({
        message: "Investment not found",
      });
    }

    const allowedFields = [
      "assetType",
      "name",
      "symbol",
      "quantity",
      "averageBuyPrice",
      "currentPrice",
      "purchaseDate",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        investment[field] = req.body[field];
      }
    });

    const updatedInvestment = await investment.save();

    return res.json(
      calculateInvestment(updatedInvestment)
    );
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Delete investment
export const deleteInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!investment) {
      return res.status(404).json({
        message: "Investment not found",
      });
    }

    await investment.deleteOne();

    return res.json({
      message: "Investment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Refresh investment with live market price
export const refreshInvestmentPrice = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!investment) {
      return res.status(404).json({
        message: "Investment not found",
      });
    }

    if (!investment.symbol) {
      return res.status(400).json({
        message: "This investment does not have a stock symbol",
      });
    }

    const yahooSymbol = investment.symbol.endsWith(".NS")
      ? investment.symbol
      : `${investment.symbol}.NS`;

    const quote = await yahooFinance.quote(yahooSymbol);

    if (quote.regularMarketPrice == null) {
      return res.status(404).json({
        message: "Live price not found",
      });
    }

    investment.currentPrice = quote.regularMarketPrice;

    const updatedInvestment = await investment.save();

    return res.json(
      calculateInvestment(updatedInvestment)
    );
  } catch (error) {
    console.error("PRICE REFRESH ERROR:", error.message);

    return res.status(500).json({
      message: "Could not refresh investment price",
      error: error.message,
    });
  }
};