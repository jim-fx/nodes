import { createUser } from "./routes/user/user.service.ts";
import { swaggerUI } from "@hono/swagger-ui";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { OpenAPIHono } from "@hono/zod-openapi";
import { nodeRouter } from "./routes/node/node.controller.ts";
import { userRouter } from "./routes/user/user.controller.ts";

const router = new OpenAPIHono();

router.use(logger());
router.use(cors());
router.route("nodes", nodeRouter);
router.route("users", userRouter);

router.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Nodarium API",
  },
});

router.get("/ui", swaggerUI({ url: "/openapi.json" }));

Deno.serve(router.fetch);

async function init() {
  const openapi = await router.request("/openapi.json");
  const json = await openapi.text();
  Deno.writeTextFile("openapi.json", json);

  await createUser("max");
}
await init();
