import {
  prop,
  getModelForClass,
  modelOptions,
  Severity,
} from "@typegoose/typegoose";

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

@modelOptions({
  schemaOptions: { timestamps: true },
  options: { allowMixed: Severity.ALLOW }, // For mixed price objects
})
class AncientTrait {
  @prop({ required: true })
  public name: string;

  @prop({ required: true })
  public text: string;
}

class Ability {
  @prop({ required: true })
  public name: string;

  @prop({ required: true })
  public text: string;

  @prop({ required: true })
  public type: string;
}

class Attack {
  @prop({ type: () => [String] })
  public cost?: string[];

  @prop({ required: true })
  public name: string;

  @prop()
  public text?: string;

  @prop()
  public damage?: string;

  @prop({ required: true })
  public convertedEnergyCost: number;
}

class WeaknessResistance {
  @prop({ required: true })
  public type: string;

  @prop({ required: true })
  public value: string;
}

class SetInfo {
  @prop({ required: true })
  public id: string;

  @prop({ required: true })
  public name: string;

  @prop({ required: true })
  public series: string;

  @prop({ required: true })
  public printedTotal: number;

  @prop({ required: true })
  public total: number;

  @prop({
    type: () => ({ unlimited: String, standard: String, expanded: String }),
  })
  public legalities: Record<string, string>;

  @prop({ required: true })
  public releaseDate: string;

  @prop({ type: () => ({ symbol: String, logo: String }) })
  public images: {
    symbol: string;
    logo: string;
  };
}

class PriceInfo<T extends TCGPlayerPrices | CardMarketPrices> {
  @prop()
  public url?: string;

  @prop()
  public updatedAt?: string;

  @prop({ type: () => Object, _id: false })
  public prices?: Record<string, T>;
}

class CardImages {
  @prop({ required: true })
  public small: string;

  @prop({ required: true })
  public large: string;
}

export class PokemonCard {
  @prop({ required: true, unique: true })
  public id: string;

  @prop({ required: true })
  public name: string;

  @prop({ required: true })
  public supertype: string;

  @prop({ type: () => [String] })
  public subtypes?: string[];

  @prop()
  public level?: string;

  @prop()
  public hp?: string;

  @prop({ type: () => [String] })
  public types?: string[];

  @prop()
  public evolvesFrom?: string;

  @prop({ type: () => [String] })
  public evolvesTo?: string[];

  @prop({ type: () => [String] })
  public rules?: string[];

  @prop({ type: () => AncientTrait })
  public ancientTrait?: AncientTrait;

  @prop({ type: () => [Ability] })
  public abilities?: Ability[];

  @prop({ type: () => [Attack] })
  public attacks?: Attack[];

  @prop({ type: () => [WeaknessResistance] })
  public weaknesses?: WeaknessResistance[];

  @prop({ type: () => [WeaknessResistance] })
  public resistances?: WeaknessResistance[];

  @prop({ type: () => [String] })
  public retreatCost?: string[];

  @prop()
  public convertedRetreatCost?: number;

  @prop({ type: () => SetInfo, required: true })
  public set: SetInfo;

  @prop({ required: true })
  public number: string;

  @prop({ required: true })
  public artist: string;

  @prop({ required: true })
  public rarity: string;

  @prop()
  public flavorText?: string;

  @prop({ type: () => [Number] })
  public nationalPokedexNumbers?: number[];

  @prop({
    type: () => ({ unlimited: String, standard: String, expanded: String }),
  })
  public legalities: Record<string, string>;

  @prop()
  public regulationMark?: string;

  @prop({ type: () => CardImages, required: true })
  public images: CardImages;

  @prop({ type: () => PriceInfo<TCGPlayerPrices> })
  public tcgplayer?: PriceInfo<TCGPlayerPrices>;

  @prop({ type: () => PriceInfo<CardMarketPrices> })
  public cardmarket?: PriceInfo<CardMarketPrices>;
}

export const PokemonCardModel = getModelForClass(PokemonCard);
