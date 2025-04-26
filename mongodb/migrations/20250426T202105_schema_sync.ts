import { Migration } from "../models/Migration";
import { MongoModels } from "../../mongodb";

const migration: Migration = {
  version: 1745698865025,
  name: "schema_sync_20250426T202105",
  description: "Auto-generated migration to sync database schema with models",
  hash: "bdd31f3d95072a9117d18dc916ba53038e3cc27b65a4d48f07ef174b60a08fa7",

  async up(models: MongoModels): Promise<void> {
    // Changes to apply
    // PokemonCardModel changes:
    // Fix missing fields in PokemonCardModel: createdAt, updatedAt, nationalPokedexNumber, schemaVersion

    const PokemonCardModelDocsToFix = await models.PokemonCardModel.find({
      $or: [
        { createdAt: { $exists: false } },
        { updatedAt: { $exists: false } },
        { nationalPokedexNumber: { $exists: false } },
        { schemaVersion: { $exists: false } },
      ],
    });

    for (const doc of PokemonCardModelDocsToFix) {
      await models.PokemonCardModel.updateOne(
        { _id: doc._id },
        {
          $set: {
            createdAt: new Date(),
            updatedAt: new Date(),
            nationalPokedexNumber: 0,
            schemaVersion: 0,
          },
        }
      );
    }

    // PokemonSetModel changes:
    // Fix missing fields in PokemonSetModel: createdAt, updatedAt, schemaVersion

    const PokemonSetModelDocsToFix = await models.PokemonSetModel.find({
      $or: [
        { createdAt: { $exists: false } },
        { updatedAt: { $exists: false } },
        { schemaVersion: { $exists: false } },
      ],
    });

    for (const doc of PokemonSetModelDocsToFix) {
      await models.PokemonSetModel.updateOne(
        { _id: doc._id },
        {
          $set: {
            createdAt: new Date(),
            updatedAt: new Date(),
            schemaVersion: 0,
          },
        }
      );
    }
  },

  async down(models: MongoModels): Promise<void> {
    // Rollback changes
    // Rollback PokemonCardModel changes
    // No rollback needed for data structure fix
    // Rollback PokemonSetModel changes
    // No rollback needed for data structure fix
  },
};

export default migration;
