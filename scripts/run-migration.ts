/**
 * Script to run MongoDB migrations
 *
 * Usage:
 *  - Run all migrations: tsx scripts/run-migration.ts
 *  - Run specific migration: tsx scripts/run-migration.ts 1_remove_properties_from_card
 */
import { runMigrations, runMigration } from "../mongodb/migrations";
import logger from "@/lib/utils/Logger";

async function main() {
  try {
    const migrationName = process.argv[2];

    if (migrationName) {
      // Run specific migration
      logger.info(`Running specific migration: ${migrationName}`);
      await runMigration(migrationName);
    } else {
      // Run all migrations
      logger.info("Running all migrations");
      await runMigrations();
    }

    logger.info("Migration process completed");
    process.exit(0);
  } catch (error) {
    logger.error("Migration process failed");
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error(String(error));
    }
    process.exit(1);
  }
}

main();
