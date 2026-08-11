import dotenv from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const envSchema = z.object({
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long"),
  PORT: z.string().optional().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"),
  TURSO_DB_URL: z.string().optional().default("file:sales.db"),
  TURSO_AUTH_TOKEN: z.string().optional(),
  SEED_ADMIN_PASSWORD: z.string().optional(),
});

let parsedEnv;

try {
  parsedEnv = envSchema.parse(process.env);
  console.log("✓ Environment validated");
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Invalid environment variables configuration:");
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join(".")}: ${err.message}`);
    });
  } else {
    console.error("❌ Environment validation error:", error);
  }
  process.exit(1);
}

export const env = parsedEnv;
export default env;
