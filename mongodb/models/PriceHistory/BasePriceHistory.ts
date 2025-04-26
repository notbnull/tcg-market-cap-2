import { prop, Ref } from "@typegoose/typegoose";
import { BaseModel } from "@/lib/mongodb";
import { PokemonCard } from "../PokemonCard/PokemonCard";

export class BasePriceHistory extends BaseModel {
  @prop({ ref: PokemonCard, required: true, index: true })
  public card: Ref<PokemonCard>;

  @prop({ required: true, type: Date, default: Date.now, index: true })
  public timestamp: Date;

  @prop({ type: String })
  public source: string;

  @prop({ type: String })
  public url?: string;
}
