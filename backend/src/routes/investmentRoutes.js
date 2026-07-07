import express from "express";

import {
  createInvestment,
  getInvestments,
  getPortfolioSummary,
  updateInvestment,
  deleteInvestment,
  refreshInvestmentPrice,
} from "../controllers/investmentController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, createInvestment)
  .get(protect, getInvestments);

router.get(
  "/summary",
  protect,
  getPortfolioSummary
);
router.put(
  "/:id/refresh-price",
  protect,
  refreshInvestmentPrice
);

router
  .route("/:id")
  .put(protect, updateInvestment)
  .delete(protect, deleteInvestment);

export default router;