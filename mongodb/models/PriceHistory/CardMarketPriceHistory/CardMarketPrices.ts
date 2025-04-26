import { prop } from "@typegoose/typegoose";
import { EmbeddedDocument } from "@/lib/mongodb";

export class CardMarketPrices extends EmbeddedDocument {
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
