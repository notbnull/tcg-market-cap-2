#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { MongoDbModels } from "@/mongodb";
import mongoose from "mongoose";
import logger from "@/lib/utils/Logger";
import dotenv from "dotenv";
import { Migration } from "@/mongodb/models/Migration";
import crypto from "crypto";

/**
 * Load environment variables
 */
dotenv.config();

/**
 * Command line arguments
 */
const args = process.argv.slice(2);
const command = args[0];

/**
 * Migration directory
 */
const MIGRATIONS_DIR = path.join(process.cwd(), "mongodb", "migrations");

/**
 * Ensure migrations directory exists
 */
if (!fs.existsSync(MIGRATIONS_DIR)) {
  fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
}

/**
 * Generate a hash for migration content
 */
function generateHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Compare schema definitions with database collections for all models
 */
async function compareSchemas(
  models: Awaited<ReturnType<typeof MongoDbModels>>
) {
  const changes: Array<{
    model: string;
    changes: string[];
    upCode: string;
    downCode: string;
  }> = [];

  try {
    const modelEntries = Object.entries(models);

    for (const [modelName, model] of modelEntries) {
      if (modelName === "MigrationHistoryModel") {
        continue;
      }

      const collectionName = model.collection.name;

      const changeItem = {
        model: modelName,
        changes: [] as string[],
        upCode: "",
        downCode: "",
      };

      const collections = await mongoose.connection.db
        .listCollections()
        .toArray();
      const collectionExists = collections.some(
        (c: { name: string }) => c.name === collectionName
      );

      if (!collectionExists) {
        changeItem.changes.push(`Create collection: ${collectionName}`);
        changeItem.upCode = `await models.${modelName}.createCollection();`;
        changeItem.downCode = `await models.${modelName}.collection.drop();`;
      } else {
        const docCount = await model.countDocuments();

        if (docCount > 0) {
          const sampleDoc = await model.findOne().lean();

          const schemaKeys = Object.keys(model.schema.paths);
          const docKeys = sampleDoc ? Object.keys(sampleDoc) : [];

          const missingFields = schemaKeys.filter(
            (key) => key !== "_id" && key !== "__v" && !docKeys.includes(key)
          );

          if (missingFields.length > 0) {
            const fieldUpdates = missingFields.map((field) => {
              const schemaType = model.schema.paths[field];
              let defaultValue = "null";

              if (schemaType.instance === "Array") {
                defaultValue = "[]";
              } else if (schemaType.instance === "Object") {
                defaultValue = "{}";
              } else if (schemaType.instance === "String") {
                defaultValue = "''";
              } else if (schemaType.instance === "Number") {
                defaultValue = "0";
              } else if (schemaType.instance === "Boolean") {
                defaultValue = "false";
              } else if (schemaType.instance === "Date") {
                defaultValue = "new Date()";
              }

              return `"${field}": ${defaultValue}`;
            });

            changeItem.changes.push(
              `Fix missing fields in ${modelName}: ${missingFields.join(", ")}`
            );
            changeItem.upCode = `
  const ${modelName}DocsToFix = await models.${modelName}.find({
    $or: ${JSON.stringify(
      missingFields.map((field) => ({ [field]: { $exists: false } }))
    ).replace(/"/g, "")}
  });
  
  for (const doc of ${modelName}DocsToFix) {
    await models.${modelName}.updateOne(
      { _id: doc._id },
      { $set: { ${fieldUpdates.join(", ")} } }
    );
  }`;
            changeItem.downCode = `// No rollback needed for data structure fix`;
          }
        }
      }

      if (changeItem.changes.length > 0) {
        changes.push(changeItem);
      }
    }
  } catch (error) {
    logger.error(
      `Error comparing schemas: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  return changes;
}

/**
 * Generate a migration based on schema differences
 */
async function generateMigration() {
  try {
    const models = await MongoDbModels();
    const schemaChanges = await compareSchemas(models);

    if (schemaChanges.length === 0) {
      logger.info("No schema changes detected.");
      return;
    }

    const timestamp = Date.now();
    const dateStr = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
    const migrationFileName = `${dateStr}_schema_sync.ts`;
    const migrationFilePath = path.join(MIGRATIONS_DIR, migrationFileName);

    const upCodeBlocks = schemaChanges.map(
      (change) =>
        `// ${change.model} changes:\n  // ${change.changes.join(
          "\n  // "
        )}\n  ${change.upCode}`
    );

    const downCodeBlocks = schemaChanges.map(
      (change) => `// Rollback ${change.model} changes\n  ${change.downCode}`
    );

    const migrationContent = `import { Migration } from '../models/Migration';
import { MongoModels } from '../../mongodb';

const migration: Migration = {
  version: ${timestamp},
  name: "schema_sync_${dateStr}",
  description: "Auto-generated migration to sync database schema with models",
  
  async up(models: MongoModels): Promise<void> {
    // Changes to apply
${upCodeBlocks.join("\n\n  ")}
  },
  
  async down(models: MongoModels): Promise<void> {
    // Rollback changes
${downCodeBlocks.join("\n\n  ")}
  }
};

export default migration;
`;

    const contentHash = generateHash(migrationContent);

    const migrationWithHash = `import { Migration } from '../models/Migration';
import { MongoModels } from '../../mongodb';

const migration: Migration = {
  version: ${timestamp},
  name: "schema_sync_${dateStr}",
  description: "Auto-generated migration to sync database schema with models",
  hash: "${contentHash}",
  
  async up(models: MongoModels): Promise<void> {
    // Changes to apply
${upCodeBlocks.join("\n\n  ")}
  },
  
  async down(models: MongoModels): Promise<void> {
    // Rollback changes
${downCodeBlocks.join("\n\n  ")}
  }
};

export default migration;
`;

    fs.writeFileSync(migrationFilePath, migrationWithHash);
    logger.info(`Migration file created: ${migrationFilePath}`);
    logger.info(
      `Changes detected: ${schemaChanges
        .map((c) => c.changes)
        .flat()
        .join(", ")}`
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Migration command failed: ${errorMessage}`);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

/**
 * Run pending migrations
 */
async function runMigrations() {
  try {
    const models = await MongoDbModels();
    const MigrationModel = models.MigrationHistoryModel;

    const migrationFiles = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))
      .sort();

    const appliedMigrations = await MigrationModel.find({})
      .sort({ version: 1 })
      .lean();

    const appliedHashes = new Set(appliedMigrations.map((m) => m.hash));

    for (const file of migrationFiles) {
      const migrationPath = path.join(MIGRATIONS_DIR, file);
      const migrationModule = await import(migrationPath);
      const migration: Migration = migrationModule.default;

      if (migration.hash && !appliedHashes.has(migration.hash)) {
        logger.info(
          `Running migration: ${migration.name} (${migration.version})`
        );

        try {
          await migration.up(models);

          await MigrationModel.create({
            version: migration.version,
            appliedAt: new Date(),
            hash: migration.hash,
          });

          logger.info(`Migration completed: ${migration.name}`);
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          logger.error(`Migration failed: ${migration.name} - ${errorMessage}`);
          throw err;
        }
      }
    }

    logger.info("All migrations completed successfully");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Migration command failed: ${errorMessage}`);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

/**
 * Main function to handle command execution
 */
async function main() {
  try {
    switch (command) {
      case "generate":
        await generateMigration();
        break;
      case "run":
        await runMigrations();
        break;
      default:
        logger.info(`
Available commands:
  generate - Generate a new migration based on schema differences
  run      - Run all pending migrations
        `);
        process.exit(0);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error: ${errorMessage}`);
    process.exit(1);
  }
}

main();
