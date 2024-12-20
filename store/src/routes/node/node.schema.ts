import {
  customType,
  foreignKey,
  index,
  json,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "../user/user.schema.ts";
import { NodeDefinition } from "./validations/types.ts";

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
  createdAt: timestamp().defaultNow(),
  systemId: varchar().notNull(),
  nodeId: varchar().notNull(),
  content: bytea().notNull(),
  definition: json().notNull().$type<NodeDefinition>(),
  hash: varchar({ length: 16 }).notNull().unique(),
  previous: varchar({ length: 16 }),
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
