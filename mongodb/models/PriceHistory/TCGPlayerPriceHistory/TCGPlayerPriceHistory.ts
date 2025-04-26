import { BasePriceHistory } from "../BasePriceHistory";
import { prop } from "@typegoose/typegoose";
import { EmbeddedDocument } from "@/lib/mongodb";
import { Schema } from "mongoose";

export class TCGPlayerPrices extends EmbeddedDocument {
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

export class TCGPlayerPriceHistory extends BasePriceHistory {
  @prop({ type: Schema.Types.Mixed })
  public price!: Record<string, TCGPlayerPrices>;
}
