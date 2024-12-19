import { router } from "./routes/router.ts";
import { createUser } from "./routes/user/user.service.ts";
import { swaggerUI } from "@hono/swagger-ui";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

async function init() {
  const openapi = await router.request("/openapi.json");
  const json = await openapi.text();
  Deno.writeTextFile("openapi.json", json);

  await createUser("max");
}
await init();

router.use(logger());
router.use(cors());

router.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Nodarium API",
  },
});

router.get("/ui", swaggerUI({ url: "/openapi.json" }));

Deno.serve(router.fetch);
