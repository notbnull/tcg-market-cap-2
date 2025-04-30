import { prop, modelOptions } from "@typegoose/typegoose";
import { BaseModel } from "@/lib/mongodb";
import { SetImages } from "./SetImages";

@modelOptions({
  schemaOptions: {
    collection: "pokemonsets",
  },
})
export class PokemonSet extends BaseModel {
  @prop({ required: true, unique: true, type: String })
  public pokemonTcgApiId: string;

  @prop({ required: false, type: String })
  public psaPopulationUrl: string;

  @prop({ required: true, type: String })
  public name: string;

  @prop({ required: true, type: String })
  public series: string;

  @prop({ required: true, type: Number })
  public printedTotal: number;

  @prop({ required: true, type: Number })
  public total: number;

  @prop({ required: true, type: String })
  public releaseDate: string;

  @prop({ type: () => SetImages })
  public images: SetImages;
}
