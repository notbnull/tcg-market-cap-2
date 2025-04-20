import { modelOptions } from "@typegoose/typegoose";

/**
 * An abstract base for all embedded documents, providing:
 * - no id field
 */
@modelOptions({
  schemaOptions: {
    _id: false,
    id: false,
  },
  options: {
    allowMixed: 0,
  },
})
export abstract class EmbeddedDocument {}
