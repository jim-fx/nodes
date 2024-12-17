import {
  customType,
  integer,
  json,
  pgTable,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { usersTable } from "../user/user.schema.ts";

const bytea = customType<{
  data: ArrayBuffer;
  default: false;
}>({
  dataType() {
    return "bytea";
  },
});

export const nodeTable = pgTable("nodes", {
  id: serial().primaryKey(),
  userId: varchar().notNull(),
  systemId: varchar().notNull(),
  nodeId: varchar().notNull(),
  content: bytea().notNull(),
  definition: json().notNull(),
  previous: integer(),
});

export const nodeRelations = relations(nodeTable, ({ one }) => ({
  userId: one(usersTable, {
    fields: [nodeTable.userId],
    references: [usersTable.id],
  }),
  previous: one(nodeTable, {
    fields: [nodeTable.previous],
    references: [nodeTable.id],
  }),
}));
