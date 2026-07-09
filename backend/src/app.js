import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import investmentRoutes from "./routes/investmentRoutes.js";
import marketRoutes from "./routes/marketRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.json({
    message: "Finance Manager API Running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/goals", goalRoutes);

export default app;