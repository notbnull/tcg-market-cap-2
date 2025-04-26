import { prop } from "@typegoose/typegoose";
import { BasePriceHistory } from "../BasePriceHistory";
import { CardMarketPrices } from "./CardMarketPrices";

export class CardMarketPriceHistory extends BasePriceHistory {
  @prop({ _id: false, required: true })
  public prices: CardMarketPrices;

  @prop({ type: () => Object, _id: false })
  public pricesByCondition?: Record<string, CardMarketPrices>;
}
