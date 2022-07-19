import { z } from "zod";

export const audioObjectSchema = z.object({
  type: z.string(),
  name: z.string().optional(),
  creator: z.string().optional(),
  image: z.string().optional(),
});
