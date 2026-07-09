import express from "express";
import { getFinancialAdvice } from "../controllers/advisorController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getFinancialAdvice);

export default router;