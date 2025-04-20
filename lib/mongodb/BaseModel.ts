import { modelOptions, prop, Severity } from "@typegoose/typegoose";
import { Types } from "mongoose";
export interface IBaseModel {
  _id: Types.ObjectId | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IBaseModelNoTimestamps {
  _id: Types.ObjectId | string;
}

@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
  schemaOptions: {
    timestamps: true,
    strict: true,
    _id: true,
    id: true,
    minimize: false,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        if (ret._id) {
          ret._id = ret._id.toString();
        }
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_, ret) => {
        if (ret._id) {
          ret._id = ret._id.toString();
        }
        return ret;
      },
    },
  },
})
export abstract class BaseModel implements IBaseModel {
  @prop({ type: Types.ObjectId, auto: true })
  public _id!: Types.ObjectId | string;

  @prop({ select: false, type: Date })
  public createdAt!: Date | string;

  @prop({ select: false, type: Date })
  public updatedAt!: Date | string;
}

@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
  schemaOptions: {
    timestamps: false,
    _id: true,
    id: true,
    minimize: false,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        if (ret._id) {
          ret._id = ret._id.toString();
        }
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_, ret) => {
        if (ret._id) {
          ret._id = ret._id.toString();
        }
        return ret;
      },
    },
  },
})
export abstract class BaseModelNoTimestamps
  implements Omit<IBaseModel, "createdAt" | "updatedAt">
{
  @prop({ type: Types.ObjectId, auto: true })
  public _id!: Types.ObjectId | string;
}
