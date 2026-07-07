import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assetType: {
      type: String,
      enum: [
        "Stock",
        "Mutual Fund",
        "ETF",
        "Crypto",
        "Fixed Deposit",
        "Other",
      ],
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    symbol: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    averageBuyPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    currentPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Investment",
  investmentSchema
);