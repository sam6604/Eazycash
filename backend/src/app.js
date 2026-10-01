import express from "express";
import { initDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

import transactionsRoute from "./routes/transactionsRoute.js";
import budgetsRoute from "./routes/budgetsRoute.js";

const app = express();

// Runs table setup once per process (or once per serverless cold start).
let dbReady;
app.use(async (req, res, next) => {
  try {
    dbReady ??= initDB();
    await dbReady;
    next();
  } catch (error) {
    dbReady = undefined;
    next(error);
  }
});

app.use(rateLimiter);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/transactions", transactionsRoute);
app.use("/api/budgets", budgetsRoute);

export default app;
