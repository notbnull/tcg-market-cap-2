import { getModelForClass, prop } from "@typegoose/typegoose";

class SetImages {
  @prop({ required: true, type: String })
  public symbol: string;

  @prop({ required: true, type: String })
  public logo: string;
}

export class PokemonSet {
  @prop({ required: true, unique: true, type: String })
  public pokemonTcgApiId: string;

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

export const PokemonSetModel = getModelForClass(PokemonSet);
