import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { z } from "@hono/zod-openapi";

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().unique().notNull(),
});

export const UserSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1), // Non-null text with a unique constraint (enforced at the database level)
  })
  .openapi("User");
