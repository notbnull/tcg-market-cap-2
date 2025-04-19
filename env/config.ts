import { loadEnvConfig } from "@next/env";

const { combinedEnv } = loadEnvConfig(process.cwd());

interface Env {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  MONGODB_URI: string;
  MONGODB_DB_NAME: string;
}

export const env = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    combinedEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: combinedEnv.CLERK_SECRET_KEY,
  MONGODB_URI: combinedEnv.MONGODB_URI,
  MONGODB_DB_NAME: combinedEnv.MONGODB_DB_NAME,
} as Env;

Object.entries(env).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`${key} is not defined in environment variables`);
  }
});
