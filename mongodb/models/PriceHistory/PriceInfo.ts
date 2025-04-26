import { prop } from "@typegoose/typegoose";
import { EmbeddedDocument } from "@/lib/mongodb";

export class PriceInfo<T> extends EmbeddedDocument {
  @prop({ type: String })
  public url?: string;

  @prop({ type: String })
  public updatedAt?: string;

  @prop({ type: () => Object, _id: false })
  public prices?: Record<string, T>;
}
