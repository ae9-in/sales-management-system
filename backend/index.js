import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import { connectDB, ensureSchema } from "./db.js";
import salesRoutes from "./routes/sales.js";
import employeeRoutes from "./routes/employees.js";
import inventoryRoutes from "./routes/inventoryroutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import reportsRoutes from "./routes/reports.js";
import authRoutes from "./routes/auth.js";
import backupRoutes from "./routes/backupRoutes.js";
import userRoutes from "./routes/users.js";
import integrationRoutes from "./routes/integrations.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = env.PORT || 5000;

app.use(helmet());
app.use(compression());
app.use(cookieParser());

// CORS configuration (Strict non-wildcard origin matching)
const allowedOrigins = env.CORS_ALLOWED_ORIGINS.split(",").map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("CORS Blocked Origin:", origin);
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
app.use("/api/users", userRoutes);
app.use("/api/integrations", integrationRoutes);

// Health check endpoint (generic degraded response on error - no raw error leakage)
app.get("/api/health", async (req, res) => {
  try {
    const db = await connectDB();
    await db.execute("SELECT 1");
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Health check DB failure:", err.message);
    res.status(503).json({ status: "degraded" });
  }
});

// 404 for unmatched API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

app.use(errorHandler);

// Start listening on non-Vercel environments (like Render or local development)
if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    try {
      await connectDB();
      await ensureSchema();
      console.log(`Server running on port ${PORT}`);
    } catch (err) {
      console.error("Database schema initialization failed on startup:", err);
    }
  });
}

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error.message);
});

export default app;
