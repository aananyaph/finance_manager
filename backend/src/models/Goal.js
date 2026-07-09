import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    targetAmount: {
      type: Number,
      required: true,
      min: 1,
    },

    savedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    deadline: {
      type: Date,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "Emergency Fund",
        "Travel",
        "Education",
        "Vehicle",
        "Home",
        "Electronics",
        "Investment",
        "Other",
      ],
      default: "Other",
    },

    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Goal", goalSchema);