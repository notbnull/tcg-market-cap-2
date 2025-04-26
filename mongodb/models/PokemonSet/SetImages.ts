import { prop } from "@typegoose/typegoose";
import { EmbeddedDocument } from "@/lib/mongodb";

export class SetImages extends EmbeddedDocument {
  @prop({ required: true, type: String })
  public symbol: string;

  @prop({ required: true, type: String })
  public logo: string;
}
