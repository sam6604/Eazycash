import express from "express";
import { clerkMiddleware } from "@clerk/express";
import { initDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import requireUser from "./middleware/requireUser.js";

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

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(clerkMiddleware());
app.use("/api", requireUser, rateLimiter);

app.use("/api/transactions", transactionsRoute);
app.use("/api/budgets", budgetsRoute);

export default app;
