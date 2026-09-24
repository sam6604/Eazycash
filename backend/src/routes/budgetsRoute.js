import express from "express";
import {
  deleteBudget,
  getBudgetsByUserAndMonth,
  upsertBudget,
} from "../controllers/budgetsController.js";

const router = express.Router();

router.get("/:userId/:month", getBudgetsByUserAndMonth);
router.post("/", upsertBudget);
router.delete("/:id", deleteBudget);

export default router;
