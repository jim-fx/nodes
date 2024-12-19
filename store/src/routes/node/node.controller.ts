import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { idRegex, NodeDefinitionSchema } from "./schemas/types.ts";
import * as service from "./node.service.ts";
import { bodyLimit } from "hono/body-limit";

const nodeRouter = new OpenAPIHono();

const SingleParam = (name: string) =>
  z
    .string()
    .min(3)
    .max(20)
    .refine(
      (value) => idRegex.test(value),
      "Name should contain only alphabets",
    )
    .openapi({ param: { name, in: "path" } });

const ParamsSchema = z.object({
  user: SingleParam("user"),
  system: SingleParam("system"),
  nodeId: SingleParam("nodeId"),
});

const getUserNodesRoute = createRoute({
  method: "get",
  path: "/{user}.json",
  request: {
    params: z.object({
      user: SingleParam("user"),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(NodeDefinitionSchema),
        },
      },
      description: "Retrieve a single node definition",
    },
  },
});
nodeRouter.openapi(getUserNodesRoute, async (c) => {
  const userId = c.req.param("user.json").replace(/\.json$/, "");
  const nodes = await service.getNodeDefinitionsByUser(userId);
  return c.json(nodes);
});

const getNodeCollectionRoute = createRoute({
  method: "get",
  path: "/{user}/{system}.json",
  request: {
    params: z.object({
      user: SingleParam("user"),
      system: SingleParam("system").optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(NodeDefinitionSchema),
        },
      },
      description: "Retrieve a single node definition",
    },
  },
});
nodeRouter.openapi(getNodeCollectionRoute, async (c) => {
  const { user } = c.req.valid("param");
  const nodeSystemId = c.req.param("system.json").replace(/\.json$/, "");

  const nodes = await service.getNodesBySystem(user, nodeSystemId);
  return c.json(nodes);
});

const getNodeDefinitionRoute = createRoute({
  method: "get",
  path: "/{user}/{system}/{nodeId}{.+\\.json}",
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: NodeDefinitionSchema,
        },
      },
      description: "Retrieve a single node definition",
    },
  },
});
nodeRouter.openapi(getNodeDefinitionRoute, async (c) => {
  const { user, system, nodeId } = c.req.valid("param");

  const node = await service.getNodeDefinitionById(
    user,
    system,
    nodeId.replace(/\.json$/, ""),
  );

  if (!node) {
    throw new HTTPException(404);
  }

  return c.json(node);
});

const getNodeWasmRoute = createRoute({
  method: "get",
  path: "/{user}/{system}/{nodeId}{.+\\.wasm}",
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/wasm": {
          schema: z.any(),
        },
      },
      description: "Retrieve a single node",
    },
  },
});
nodeRouter.openapi(getNodeWasmRoute, async (c) => {
  const { user, system, nodeId } = c.req.valid("param");

  const a = performance.now();
  const wasmContent = await service.getNodeWasmById(
    user,
    system,
    nodeId.replace(/\.wasm/, ""),
  );

  c.header("Content-Type", "application/wasm");

  return c.body(wasmContent);
});

const createNodeRoute = createRoute({
  method: "post",
  path: "/",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: NodeDefinitionSchema,
        },
      },
      description: "Create a single node",
    },
  },
  middleware: [
    bodyLimit({
      maxSize: 128 * 1024, // 128kb
      onError: (c) => {
        return c.text("Node content too large", 413);
      },
    }),
  ],
});
nodeRouter.openapi(createNodeRoute, async (c) => {
  const buffer = await c.req.arrayBuffer();
  const bytes = await (await c.req.blob()).bytes();
  const node = await service.createNode(buffer, bytes);
  return c.json(node);
});

export { nodeRouter };
