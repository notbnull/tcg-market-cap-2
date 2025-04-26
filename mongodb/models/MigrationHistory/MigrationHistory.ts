import { prop } from "@typegoose/typegoose";
import { BaseModel } from "@/lib/mongodb";

export class MigrationHistory extends BaseModel {
  @prop({ required: true, type: Number })
  public version: number;

  @prop({ required: true, type: String })
  public migrationCid: string;

  @prop({ required: true, type: String })
  public hash: string;

  @prop({ required: true, type: Date })
  public appliedAt: Date;
}
