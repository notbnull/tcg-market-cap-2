import { BaseModel } from "@/lib/mongodb/BaseModel";
import { prop, Ref, modelOptions } from "@typegoose/typegoose";
import { PokemonCard } from "../PokemonCard/PokemonCard";
import { Schema } from "mongoose";

/**
 * Model for storing PSA card population data
 */
@modelOptions({
  schemaOptions: {
    collection: "psapopulations",
  },
})
export class PsaPopulation extends BaseModel {
  @prop({ type: PokemonCard, required: true })
  public card!: Ref<PokemonCard>;

  @prop({ type: Schema.Types.Mixed, required: true })
  public populations!: Record<number, number>; // grade -> population
}
