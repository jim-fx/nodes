import {
  customType,
  foreignKey,
  index,
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
  userId: varchar().notNull().references(() => usersTable.name),
  systemId: varchar().notNull(),
  nodeId: varchar().notNull(),
  content: bytea().notNull(),
  definition: json().notNull(),
  hash: varchar({ length: 8 }).notNull(),
  previous: varchar({ length: 8 }),
}, (table) => [
  foreignKey({
    columns: [table.previous],
    foreignColumns: [table.hash],
    name: "node_previous_fk",
  }),
  index("user_id_idx").on(table.userId),
  index("system_id_idx").on(table.systemId),
  index("node_id_idx").on(table.nodeId),
  index("hash_idx").on(table.hash),
]);
