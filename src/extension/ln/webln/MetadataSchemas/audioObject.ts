import type { JSONSchemaType } from "ajv";

interface audioObject {
  type: string;
  name?: string;
  creator?: string;
  image?: string;
}
export const audioObjectSchema: JSONSchemaType<audioObject> = {
  type: "object",
  properties: {
    type: { type: "string", nullable: true },
    name: { type: "string", nullable: true },
    creator: { type: "string", nullable: true },
    image: { type: "string", nullable: true },
  },
  required: ["type"],
  additionalProperties: false,
};
