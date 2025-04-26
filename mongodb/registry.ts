import { mongoose } from "@typegoose/typegoose";
import { getModelForClass, ReturnModelType } from "@typegoose/typegoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";
import { addSerializationOptionsPlugin, schemaVersionPlugin } from "./plugins";
import { env } from "@/env/config";
import logger from "@/lib/utils/Logger";

// Import model classes
import { PokemonCard } from "./models/PokemonCard/PokemonCard";
import { PokemonSet } from "./models/PokemonSet/PokemonSet";
import { TCGPlayerPriceHistory } from "./models/PriceHistory/TCGPlayerPriceHistory/TCGPlayerPriceHistory";
import { CardMarketPriceHistory } from "./models/PriceHistory/CardMarketPriceHistory/CardMarketPriceHistory";

const MONGODB_URI = env.MONGODB_URI;
const MONGODB_DB_NAME = env.MONGODB_DB_NAME;

// Type for initialization function
type InitializerFn = () => Promise<void>;

// Export the class declaration before defining it
export default class ModelRegistry {
  private static _instance: ModelRegistry | null = null;
  private _isInitialized = false;
  private _isConnected = false;
  private _connectionPromise: Promise<void> | null = null;

  // Model definitions
  private _pokemonCardModel: ReturnModelType<
    typeof PokemonCard,
    object
  > | null = null;
  private _pokemonSetModel: ReturnModelType<typeof PokemonSet, object> | null =
    null;

  private _tCGPriceHistoryModel: ReturnModelType<
    typeof TCGPlayerPriceHistory,
    object
  > | null = null;

  private _cardMarketPriceHistoryModel: ReturnModelType<
    typeof CardMarketPriceHistory,
    object
  > | null = null;

  private constructor() {}

  public static getInstance(): ModelRegistry {
    if (!ModelRegistry._instance) {
      ModelRegistry._instance = new ModelRegistry();
    }
    return ModelRegistry._instance;
  }

  // Add public getters for initialized and connected state
  public get isInitialized(): boolean {
    return this._isInitialized;
  }

  public get isConnected(): boolean {
    return this._isConnected;
  }

  public async init(): Promise<void> {
    if (this._isInitialized) {
      return;
    }

    // Apply global plugins
    mongoose.plugin(mongooseLeanVirtuals);

    // Register models with plugins
    this._pokemonCardModel = this.registerModel(PokemonCard);
    this._pokemonSetModel = this.registerModel(PokemonSet);
    this._tCGPriceHistoryModel = this.registerModel(TCGPlayerPriceHistory);
    this._cardMarketPriceHistoryModel = this.registerModel(
      CardMarketPriceHistory
    );

    this._isInitialized = true;

    // Establish MongoDB connection
    await this.connect();
  }

  private async connect(): Promise<void> {
    if (this._isConnected) {
      return;
    }

    if (this._connectionPromise) {
      return this._connectionPromise;
    }

    this._connectionPromise = new Promise<void>((resolve, reject) => {
      logger.info("Establishing MongoDB connection");

      mongoose.set("bufferCommands", false);

      mongoose
        .connect(MONGODB_URI, {
          dbName: MONGODB_DB_NAME,
        })
        .then(() => {
          logger.info(`Connected to MongoDB database: ${MONGODB_DB_NAME}`);
          this._isConnected = true;
          resolve();
        })
        .catch((error) => {
          logger.error(`MongoDB connection error: ${error}`);
          this._isConnected = false;
          this._connectionPromise = null;
          reject(error);
        });

      mongoose.connection.on("disconnected", () => {
        logger.warn("MongoDB disconnected");
        this._isConnected = false;
        this._connectionPromise = null;
      });
    });

    return this._connectionPromise;
  }

  private registerModel<
    T extends
      | typeof PokemonCard
      | typeof PokemonSet
      | typeof TCGPlayerPriceHistory
      | typeof CardMarketPriceHistory
  >(ModelClass: T): ReturnModelType<T, object> {
    try {
      // Check if model already exists in mongoose models
      const modelName = ModelClass.name;
      if (mongoose.models[modelName]) {
        logger.debug(`Using existing model: ${modelName}`);
        return mongoose.models[modelName] as ReturnModelType<T, object>;
      }

      // If not, create a new model
      const model = getModelForClass(ModelClass);

      // Apply plugins to the schema
      const schema = model.schema;
      addSerializationOptionsPlugin(schema);
      schemaVersionPlugin(schema);

      return model;
    } catch (err) {
      logger.error(`Error registering model: ${err}`);

      // If error occurs but model exists, return the existing model
      const modelName = ModelClass.name;
      if (mongoose.models[modelName]) {
        return mongoose.models[modelName] as ReturnModelType<T, object>;
      }

      throw err;
    }
  }

  // Getters for models with connection handling
  public get PokemonCardModel(): ReturnModelType<typeof PokemonCard, object> {
    if (!this._isInitialized) {
      throw new Error("ModelRegistry not initialized. Call init() first");
    }

    if (!this._isConnected) {
      this.connect().catch((err) => {
        logger.error(`Failed to connect to MongoDB: ${err}`);
      });
    }

    return this._pokemonCardModel!;
  }

  public get PokemonSetModel(): ReturnModelType<typeof PokemonSet, object> {
    if (!this._isInitialized) {
      throw new Error("ModelRegistry not initialized. Call init() first");
    }

    if (!this._isConnected) {
      this.connect().catch((err) => {
        logger.error(`Failed to connect to MongoDB: ${err}`);
      });
    }

    return this._pokemonSetModel!;
  }

  public get TCGPlayerPriceHistoryModel(): ReturnModelType<
    typeof TCGPlayerPriceHistory,
    object
  > {
    if (!this._isInitialized) {
      throw new Error("ModelRegistry not initialized. Call init() first");
    }

    if (!this._isConnected) {
      this.connect().catch((err) => {
        logger.error(`Failed to connect to MongoDB: ${err}`);
      });
    }

    return this._tCGPriceHistoryModel!;
  }

  public get CardMarketPriceHistoryModel(): ReturnModelType<
    typeof CardMarketPriceHistory,
    object
  > {
    if (!this._isInitialized) {
      throw new Error("ModelRegistry not initialized. Call init() first");
    }

    if (!this._isConnected) {
      this.connect().catch((err) => {
        logger.error(`Failed to connect to MongoDB: ${err}`);
      });
    }

    return this._cardMarketPriceHistoryModel!;
  }
}
