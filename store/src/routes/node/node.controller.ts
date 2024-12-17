import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { NodeDefinitionSchema } from "./types.ts";
import * as service from "./node.service.ts";
import { bodyLimit } from "hono/body-limit";

const nodeRouter = new OpenAPIHono();

const SingleParam = (name: string) =>
  z
    .string()
    .min(3)
    .max(20)
    .refine(
      (value) => /^[a-z_-]+$/i.test(value),
      "Name should contain only alphabets",
    )
    .openapi({ param: { name, in: "path" } });

const ParamsSchema = z.object({
  userId: SingleParam("userId"),
  nodeSystemId: SingleParam("nodeSystemId"),
  nodeId: SingleParam("nodeId"),
});

const getNodeCollectionRoute = createRoute({
  method: "get",
  path: "/{userId}/{nodeSystemId}.json",
  request: {
    params: z.object({
      userId: SingleParam("userId"),
      nodeSystemId: SingleParam("nodeSystemId").optional(),
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
  const { userId } = c.req.valid("param");
  const nodeSystemId = c.req.param("nodeSystemId.json").replace(/\.json$/, "");

  const nodes = await service.getNodesBySystem(userId, nodeSystemId);

  return c.json(nodes);
});

const getNodeDefinitionRoute = createRoute({
  method: "get",
  path: "/{userId}/{nodeSystemId}/{nodeId}.json",
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
nodeRouter.openapi(getNodeDefinitionRoute, (c) => {
  return c.json({
    id: "",
  });
});

const getNodeWasmRoute = createRoute({
  method: "get",
  path: "/{userId}/{nodeSystemId}/{nodeId}.wasm",
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

nodeRouter.openapi(getNodeWasmRoute, (c) => {
  return c.json({
    id: "",
  });
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
      maxSize: 50 * 1024, // 50kb
      onError: (c) => {
        return c.text("overflow :(", 413);
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
