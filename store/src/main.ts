import { OpenAPIHono } from "@hono/zod-openapi";
import { router } from "./routes/router.ts";
import { createUser } from "./routes/user/user.service.ts";
import { swaggerUI } from "@hono/swagger-ui";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

await createUser("max");

const app = new OpenAPIHono();
app.use("/v1/*", cors());
app.use(logger());
app.route("v1", router);

app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Nodarium API",
  },
});

app.get("/ui", swaggerUI({ url: "/openapi.json" }));

Deno.serve(app.fetch);
