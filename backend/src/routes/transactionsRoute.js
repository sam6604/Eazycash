import express from "express";
import {
  createTransaction,
  deleteTransaction,
  getCategoryBreakdown,
  getMonthlyTrend,
  getSummaryByUserId,
  getTransactionsByUserId,
} from "../controllers/transactionsController.js";

const router = express.Router();

router.get("/insights/category/:userId", getCategoryBreakdown);
router.get("/insights/trend/:userId", getMonthlyTrend);
router.get("/summary/:userId", getSummaryByUserId);
router.get("/:userId", getTransactionsByUserId);
router.post("/", createTransaction);
router.delete("/:id", deleteTransaction);

export default router;
