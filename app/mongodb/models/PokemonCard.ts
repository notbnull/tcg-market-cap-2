import {
  prop,
  getModelForClass,
  modelOptions,
  Severity,
} from "@typegoose/typegoose";
import type { Ref } from "react";
import { PokemonSet } from "./PokemonSet";
import setupMongo from "../setup";
import { Timer } from "@/app/utils/timerDecorator";
import logger from "../../utils/Logger";
interface TCGPlayerPrices {
  low?: number;
  mid?: number;
  high?: number;
  market?: number;
  directLow?: number;
}

interface CardMarketPrices {
  averageSellPrice?: number;
  lowPrice?: number;
  trendPrice?: number;
  germanProLow?: number;
  suggestedPrice?: number;
  reverseHoloSell?: number;
  reverseHoloLow?: number;
  reverseHoloTrend?: number;
  lowPriceExPlus?: number;
  avg1?: number;
  avg7?: number;
  avg30?: number;
  reverseHoloAvg1?: number;
  reverseHoloAvg7?: number;
  reverseHoloAvg30?: number;
}

class PriceInfo<T extends TCGPlayerPrices | CardMarketPrices> {
  @prop({ type: String })
  public url?: string;

  @prop({ type: String })
  public updatedAt?: string;

  @prop({ type: () => Object, _id: false })
  public prices?: Record<string, T>;
}

class CardImages {
  @prop({ required: true, type: String })
  public small: string;

  @prop({ required: true, type: String })
  public large: string;
}

@modelOptions({
  schemaOptions: { timestamps: true },
  options: { allowMixed: Severity.ALLOW }, // For mixed price objects
})
export class PokemonCard {
  @prop({ required: true, unique: true, type: String })
  public pokemonTcgApiId: string;

  @prop({ required: true, type: String })
  public name: string;

  @prop({ ref: () => PokemonSet, required: true })
  public set: Ref<PokemonSet>;

  @prop({ required: true, type: String })
  public number: string;

  @prop({ required: true, type: String })
  public artist: string;

  @prop({ required: true, type: String })
  public rarity: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @prop({ type: Number, required: false })
  public nationalPokedexNumber?: number;

  @prop({ type: () => CardImages, required: true })
  public images: CardImages;

  @prop({ type: () => PriceInfo<TCGPlayerPrices> })
  public tcgplayer?: PriceInfo<TCGPlayerPrices>;

  @prop({ type: () => PriceInfo<CardMarketPrices> })
  public cardmarket?: PriceInfo<CardMarketPrices>;

  @Timer
  public static async getMongoModel() {
    const db = await setupMongo();
    logger.info("Getting PokemonCard Model");
    if (db.models.PokemonCard) {
      logger.info("PokemonCard Model already exists");
      return db.models.PokemonCard;
    }
    logger.info("Creating PokemonCard Model");
    return db.model("PokemonCard", getModelForClass(PokemonCard).schema);
  }
}
