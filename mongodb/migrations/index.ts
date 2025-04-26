/**
 * Migration Framework for MongoDB
 *
 * This file provides a simple framework for running MongoDB migrations.
 * Each migration is a separate file that exports a 'up' function.
 */
import { MongoDbModels } from "../index";
import fs from "fs";
import path from "path";
import logger from "@/lib/utils/Logger";

/**
 * Interface for migration module
 */
export interface MigrationModule {
  up: () => Promise<void>;
}

/**
 * Interface for migration with name
 */
export interface Migration extends MigrationModule {
  name: string;
}

/**
 * Run all migrations in sequence
 */
export async function runMigrations() {
  logger.info("Starting migrations");

  const migrations = await loadMigrations();
  await MongoDbModels();

  for (const migration of migrations) {
    try {
      logger.info(`Running migration: ${migration.name}`);
      await migration.up();
      logger.info(`Migration complete: ${migration.name}`);
    } catch (error) {
      logger.error(`Migration failed: ${migration.name}`);
      if (error instanceof Error) {
        logger.error(error.message);
      } else {
        logger.error(String(error));
      }
      throw error;
    }
  }

  logger.info("All migrations completed successfully");
}

/**
 * Load migrations from the migrations directory
 */
async function loadMigrations(): Promise<Migration[]> {
  const migrationsDir = path.join(__dirname);

  // Get all .ts files except for this index file
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".ts") && file !== "index.ts")
    .sort(); // Sort to ensure migrations run in order

  // Load each migration using dynamic import
  const migrations: Migration[] = [];

  for (const file of files) {
    try {
      // Convert relative path to a module specifier that works with dynamic import
      const modulePath = `./${file.replace(/\.ts$/, "")}`;
      const migrationModule = (await import(modulePath)) as MigrationModule;

      migrations.push({
        ...migrationModule,
        name: file.replace(/\.ts$/, ""),
      });
    } catch (error) {
      logger.error(`Failed to load migration: ${file}`);
      if (error instanceof Error) {
        logger.error(error.message);
      } else {
        logger.error(String(error));
      }
      throw error;
    }
  }

  return migrations;
}

/**
 * Run a specific migration by name
 */
export async function runMigration(migrationName: string) {
  logger.info(`Running specific migration: ${migrationName}`);

  try {
    // Convert to a module specifier that works with dynamic import
    const modulePath = `./${migrationName}`;
    const migrationModule = (await import(modulePath)) as MigrationModule;

    const migration: Migration = {
      ...migrationModule,
      name: migrationName,
    };

    await migration.up();
    logger.info(`Migration complete: ${migrationName}`);
  } catch (error) {
    logger.error(`Migration failed: ${migrationName}`);
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error(String(error));
    }
    throw error;
  }
}
