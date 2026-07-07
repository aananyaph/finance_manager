import express from "express";
import { getStockPrice } from "../controllers/marketController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/price/:symbol", protect, getStockPrice);

export default router;