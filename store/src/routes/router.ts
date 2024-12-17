import { OpenAPIHono } from "@hono/zod-openapi";
import { nodeRouter } from "./node/node.controller.ts";
import { userRouter } from "./user/user.controller.ts";

const router = new OpenAPIHono();

router.route("nodes", nodeRouter);
router.route("nodes", userRouter);

export { router };
