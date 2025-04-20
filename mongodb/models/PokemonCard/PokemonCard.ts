import { prop, Ref } from "@typegoose/typegoose";
import { PokemonSet } from "../PokemonSet/PokemonSet";
import { BaseModel, EmbeddedDocument } from "@/lib/mongodb";

type ObjectIdString = string;

class TCGPlayerPrices extends EmbeddedDocument {
  @prop({ type: Number })
  public low?: number;

  @prop({ type: Number })
  public mid?: number;

  @prop({ type: Number })
  public high?: number;

  @prop({ type: Number })
  public market?: number;

  @prop({ type: Number })
  public directLow?: number;
}

class CardMarketPrices extends EmbeddedDocument {
  @prop({ type: Number })
  public averageSellPrice?: number;

  @prop({ type: Number })
  public lowPrice?: number;

  @prop({ type: Number })
  public trendPrice?: number;

  @prop({ type: Number })
  public germanProLow?: number;

  @prop({ type: Number })
  public suggestedPrice?: number;

  @prop({ type: Number })
  public reverseHoloSell?: number;

  @prop({ type: Number })
  public reverseHoloLow?: number;

  @prop({ type: Number })
  public reverseHoloTrend?: number;

  @prop({ type: Number })
  public lowPriceExPlus?: number;

  @prop({ type: Number })
  public avg1?: number;

  @prop({ type: Number })
  public avg7?: number;

  @prop({ type: Number })
  public avg30?: number;

  @prop({ type: Number })
  public reverseHoloAvg1?: number;

  @prop({ type: Number })
  public reverseHoloAvg7?: number;

  @prop({ type: Number })
  public reverseHoloAvg30?: number;
}

class PriceInfo<T> extends EmbeddedDocument {
  @prop({ type: String })
  public url?: string;

  @prop({ type: String })
  public updatedAt?: string;

  @prop({ type: () => Object, _id: false })
  public prices?: Record<string, T>;
}

class CardImages extends EmbeddedDocument {
  @prop({ required: true, type: String })
  public small: string;

  @prop({ required: true, type: String })
  public large: string;
}

export class PokemonCard extends BaseModel {
  @prop({ required: true, unique: true, type: String })
  public pokemonTcgApiId: string;

  @prop({ required: true, type: String })
  public name: string;

  @prop({ ref: () => PokemonSet, required: true })
  public set: Ref<PokemonSet> | ObjectIdString;

  @prop({ required: true, type: String })
  public number: string;

  @prop({ required: true, type: String })
  public artist: string;

  @prop({ required: true, type: String })
  public rarity: string;

  @prop({ type: Number, required: false })
  public nationalPokedexNumber?: number;

  @prop({ type: () => CardImages, required: true })
  public images: CardImages;

  @prop({ type: () => PriceInfo<TCGPlayerPrices> })
  public tcgplayer?: PriceInfo<TCGPlayerPrices>;

  @prop({ type: () => PriceInfo<CardMarketPrices> })
  public cardmarket?: PriceInfo<CardMarketPrices>;
}
