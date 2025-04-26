import { MongoModels } from "../../mongodb";

/**
 * Interface for MongoDB migrations
 */
export interface Migration {
  /**
   * Version identifier for the migration (typically a timestamp)
   */
  version: number;

  /**
   * Human-readable name for the migration
   */
  name: string;

  /**
   * Description of what the migration does
   */
  description: string;

  /**
   * Hash of the migration content for tracking applied migrations
   */
  hash?: string;

  /**
   * Function to apply the migration
   */
  up(models: MongoModels): Promise<void>;

  /**
   * Function to roll back the migration
   */
  down(models: MongoModels): Promise<void>;
}
