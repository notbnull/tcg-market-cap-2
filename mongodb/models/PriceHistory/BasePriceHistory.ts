import { prop, Ref } from "@typegoose/typegoose";
import { BaseModel } from "@/lib/mongodb";
import { PokemonCard } from "../PokemonCard/PokemonCard";

export class BasePriceHistory extends BaseModel {
  @prop({ ref: PokemonCard, required: true, index: true })
  public card: Ref<PokemonCard>;

  @prop({ type: String, required: true, index: true })
  public lastDayUpdated: string;

  @prop({ type: String })
  public url: string;
}
