import { getModelForClass, prop } from "@typegoose/typegoose";
import setupMongo from "../setup";
import { Timer } from "@/app/utils/timerDecorator";

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

  @Timer
  public static async getMongoModel() {
    const db = await setupMongo();
    if (db.models.PokemonSet) {
      return db.models.PokemonSet;
    }
    return db.model("PokemonSet", getModelForClass(PokemonSet).schema);
  }
}
