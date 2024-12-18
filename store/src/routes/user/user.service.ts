import { eq } from "drizzle-orm";
import { db } from "../../db/db.ts";
import { usersTable } from "./user.schema.ts";
import * as uuid from "jsr:@std/uuid";

export async function createUser(userName: string) {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.name, userName));

  if (user.length) {
    return;
  }

  return await db
    .insert(usersTable)
    .values({ id: uuid.v1.generate(), name: userName });
}

export async function findUserByName(userName: string) {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.name, userName)).limit(1);

  return users[0];
}
