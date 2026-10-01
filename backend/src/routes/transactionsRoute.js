import express from "express";
import {
  createTransaction,
  deleteTransaction,
  getCategoryBreakdown,
  getMonthlyTrend,
  getSummaryByUserId,
  getTransactionsByUserId,
} from "../controllers/transactionsController.js";
import { matchUserParam } from "../middleware/requireUser.js";

const router = express.Router();

router.get("/insights/category/:userId", matchUserParam, getCategoryBreakdown);
router.get("/insights/trend/:userId", matchUserParam, getMonthlyTrend);
router.get("/summary/:userId", matchUserParam, getSummaryByUserId);
router.get("/:userId", matchUserParam, getTransactionsByUserId);
router.post("/", createTransaction);
router.delete("/:id", deleteTransaction);

export default router;
