import express from "express";

import {
  createGoal,
  getGoals,
  updateGoal,
  addContribution,
  deleteGoal,
} from "../controllers/goalController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, createGoal)
  .get(protect, getGoals);

router.put(
  "/:id/contribute",
  protect,
  addContribution
);

router
  .route("/:id")
  .put(protect, updateGoal)
  .delete(protect, deleteGoal);

export default router;