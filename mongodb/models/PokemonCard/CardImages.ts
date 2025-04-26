import { prop } from "@typegoose/typegoose";
import { EmbeddedDocument } from "@/lib/mongodb";

export class CardImages extends EmbeddedDocument {
  @prop({ required: true, type: String })
  public small: string;

  @prop({ required: true, type: String })
  public large: string;
}
