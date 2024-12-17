import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { UserSchema, usersTable } from "./user.schema.ts";
import { db } from "../../db/db.ts";
import { findUserByName } from "./user.service.ts";

const userRouter = new OpenAPIHono();

const getAllUsersRoute = createRoute({
  method: "get",
  path: "/users.json",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(UserSchema),
        },
      },
      description: "Retrieve a single node definition",
    },
  },
});

userRouter.openapi(getAllUsersRoute, async (c) => {
  const users = await db.select().from(usersTable);
  return c.json(users);
});

const getSingleUserRoute = createRoute({
  method: "get",
  path: "/{userId}.json",
  request: {
    params: z.object({ userId: z.string().optional() }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
      description: "Retrieve a single node definition",
    },
  },
});

userRouter.openapi(getSingleUserRoute, async (c) => {
  const userId = c.req.param("userId.json");

  const user = await findUserByName(userId.replace(/\.json$/, ""));

  return c.json(user);
});

export { userRouter };
