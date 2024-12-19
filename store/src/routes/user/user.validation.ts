import { z } from "@hono/zod-openapi";

export const UserSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1),
  })
  .openapi("User");
