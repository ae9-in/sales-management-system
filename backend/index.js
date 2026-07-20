import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";

import { connectDB, ensureSchema } from "./db.js";
import salesRoutes from "./routes/sales.js";
import employeeRoutes from "./routes/employees.js";
import inventoryRoutes from "./routes/inventoryroutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import reportsRoutes from "./routes/reports.js";
import authRoutes from "./routes/auth.js";
import backupRoutes from "./routes/backupRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

// only load .env file in dev — Vercel injects env vars directly
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(compression());

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());

// Connect DB before every request (cached after first call)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection error:", err.message);
    res.status(503).json({ message: "Database unavailable. Please try again shortly." });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/backup", backupRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 for unmatched API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

app.use(errorHandler);

// Local dev only
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, async () => {
    try {
      await connectDB();
      await ensureSchema();
      console.log(`Server running on http://localhost:${PORT}`);
    } catch (err) {
      console.error("Database schema initialization failed on startup:", err);
    }
  });
}

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error.message);
});

export default app;
