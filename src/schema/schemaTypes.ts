import { z } from "zod";

import { audioObjectSchema } from "./audioObjectSchema";

export type audioObject = z.infer<typeof audioObjectSchema>;
