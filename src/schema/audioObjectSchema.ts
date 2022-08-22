import { z } from "zod";

export const audioObjectSchema = z.object({
  type: z.string(),
  contentUrl: z.string().optional(),
  url: z.string().optional(),
  embedUrl: z.string().optional(),
  thumbnail: z.string().optional(),
  name: z.string().optional(),
  creator: z.string().optional(),
  image: z.string().optional(),
  widht: z.number().optional(),
  height: z.number().optional(),
});
