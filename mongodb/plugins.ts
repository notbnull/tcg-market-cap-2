import { Schema } from "mongoose";

export const addSerializationOptionsPlugin = (schema: Schema) => {
  const defaultSerializationOptions = {
    getters: false, // Don't include all getters
    virtuals: true,
    flattenObjectIds: true,
    flattenMaps: true,
    versionKey: false,
    minimize: false,
  } as const;

  schema.set("toJSON", defaultSerializationOptions);
  schema.set("toObject", defaultSerializationOptions);
};

export const schemaVersionPlugin = (schema: Schema) => {
  schema.add({ schemaVersion: { type: Number, default: 1 } });
};
