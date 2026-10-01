import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { initDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import requireUser from "./middleware/requireUser.js";

import transactionsRoute from "./routes/transactionsRoute.js";
import budgetsRoute from "./routes/budgetsRoute.js";

const app = express();

// Lets the Expo web build call the API from the browser. Auth uses a bearer
// token (not cookies), so allowing any origin doesn't expose user data.
app.use(cors());

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
