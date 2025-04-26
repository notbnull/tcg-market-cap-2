import { prop } from "@typegoose/typegoose";
import { TCGPlayerPrices } from "./TCGPlayerPrices";
import { BasePriceHistory } from "../BasePriceHistory";

export class TCGPlayerPriceHistory extends BasePriceHistory {
  @prop({ _id: false })
  public price!: TCGPlayerPrices;

  @prop({ type: () => Object, _id: false })
  public pricesByCondition!: Record<string, TCGPlayerPrices>;
}
