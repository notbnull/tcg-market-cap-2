import { getModelForClass, prop } from "@typegoose/typegoose";
import { Timer } from "@/lib/utils/timerDecorator";
import mongoose from "mongoose";
import logger from "@/lib/utils/Logger";
import { getModel } from "../utils/modelUtils";

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

  // Static schema creation - outside of the class instance
  private static schemaInstance: mongoose.Schema | undefined;

  private static getSchema(): mongoose.Schema {
    if (!PokemonSet.schemaInstance) {
      logger.info("Creating PokemonSet schema for the first time");
      PokemonSet.schemaInstance = getModelForClass(PokemonSet).schema;
    }
    return PokemonSet.schemaInstance;
  }

  @Timer
  public static async getMongoModel(): Promise<mongoose.Model<PokemonSet>> {
    logger.info("Getting PokemonSet Model");
    return getModel<PokemonSet>("PokemonSet", () => PokemonSet.getSchema());
  }
}
