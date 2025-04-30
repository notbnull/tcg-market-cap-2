import { prop, Ref, modelOptions } from "@typegoose/typegoose";
import { BaseModel } from "@/lib/mongodb";
import { PokemonSet } from "../PokemonSet/PokemonSet";
import { CardImages } from "./CardImages";

@modelOptions({
  schemaOptions: {
    collection: "pokemoncards",
  },
})
export class PokemonCard extends BaseModel {
  @prop({ required: true, unique: true, type: String })
  public pokemonTcgApiId: string;

  @prop({ type: String })
  public psaSpecId: string;

  @prop({ required: true, type: String })
  public name: string;

  @prop({ ref: () => PokemonSet })
  public set: Ref<PokemonSet>;

  @prop({ required: true, type: String })
  public number: string;

  @prop({ required: true, type: String })
  public artist: string;

  @prop({ required: true, type: String })
  public rarity: string;

  @prop({ type: Number })
  public nationalPokedexNumber?: number;

  @prop({ type: () => CardImages })
  public images: CardImages;
}
