import { loadEnvConfig } from "@next/env";

// Load environment variables
const { combinedEnv } = loadEnvConfig(process.cwd());

// Type your environment variables
interface Env {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  MONGODB_URI: string;
  MONGODB_DB_NAME: string;
  NEXT_RUNTIME: string;
}

// Create and validate env object
export const env = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    combinedEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: combinedEnv.CLERK_SECRET_KEY,
  MONGODB_URI: combinedEnv.MONGODB_URI,
  MONGODB_DB_NAME: combinedEnv.MONGODB_DB_NAME,
  NEXT_RUNTIME: combinedEnv.NEXT_RUNTIME,
} as Env;

// Validate required variables
Object.entries(env).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`${key} is not defined in environment variables`);
  }
});
