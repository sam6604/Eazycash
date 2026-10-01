import express from "express";
import {
  deleteBudget,
  getBudgetsByUserAndMonth,
  upsertBudget,
} from "../controllers/budgetsController.js";
import { matchUserParam } from "../middleware/requireUser.js";

const router = express.Router();

router.get("/:userId/:month", matchUserParam, getBudgetsByUserAndMonth);
router.post("/", upsertBudget);
router.delete("/:id", deleteBudget);

export default router;
