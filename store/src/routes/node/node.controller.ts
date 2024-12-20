import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { idRegex, NodeDefinitionSchema } from "./validations/types.ts";
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
      `${name} should contain only letters, numbers, "-" or "_"`,
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
      user: SingleParam("user").optional(),
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
  const nodes = await service.getNodeDefinitionsByUser(
    userId,
  );
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
  path: "/{user}/{system}/{nodeId}.json",
  request: {
    params: z.object({
      user: SingleParam("user"),
      system: SingleParam("system"),
      nodeId: SingleParam("nodeId").optional(),
    }),
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
  const { user, system } = c.req.valid("param");
  const nodeId = c.req.param("nodeId.json").replace(/\.json$/, "");

  const node = await service.getNodeDefinitionById(
    user,
    system,
    nodeId,
  );

  if (!node) {
    throw new HTTPException(404);
  }

  return c.json(node);
});

const getNodeWasmRoute = createRoute({
  method: "get",
  path: "/{user}/{system}/{nodeId}.wasm",
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

  const wasmContent = await service.getNodeWasmById(
    user,
    system,
    nodeId.replace(/\.wasm/, ""),
  );

  c.header("Content-Type", "application/wasm");

  return c.body(wasmContent);
});

const getNodeVersionWasmRoute = createRoute({
  method: "get",
  path: "/{user}/{system}/{nodeId}@{hash}.wasm",
  request: {
    params: z.object({
      user: SingleParam("user"),
      system: SingleParam("system"),
      nodeId: SingleParam("nodeId"),
      hash: SingleParam("hash"),
    }),
  },
  responses: {
    200: {
      content: {
        "application/wasm": {
          schema: z.any(),
        },
      },
      description: "Create a single node",
    },
  },
});

nodeRouter.openapi(getNodeVersionWasmRoute, async (c) => {
  const { user, system, nodeId, hash } = c.req.valid("param");

  const nodes = await service.getNodeVersionWasm(user, system, nodeId, hash);

  return c.json(nodes);
});

const getNodeVersionRoute = createRoute({
  method: "get",
  path: "/{user}/{system}/{nodeId}@{hash}.json",
  request: {
    params: z.object({
      user: SingleParam("user"),
      system: SingleParam("system"),
      nodeId: SingleParam("nodeId"),
      hash: SingleParam("hash"),
    }),
  },
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
});

nodeRouter.openapi(getNodeVersionRoute, async (c) => {
  const { user, system, nodeId, hash } = c.req.valid("param");

  const nodes = await service.getNodeVersion(user, system, nodeId, hash);

  return c.json(nodes);
});

const getNodeVersionsRoute = createRoute({
  method: "get",
  path: "/{user}/{system}/{nodeId}/versions.json",
  request: {
    params: z.object({
      user: SingleParam("user"),
      system: SingleParam("system"),
      nodeId: SingleParam("nodeId"),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(NodeDefinitionSchema),
        },
      },
      description: "Create a single node",
    },
  },
});

nodeRouter.openapi(getNodeVersionsRoute, async (c) => {
  const { user, system, nodeId } = c.req.valid("param");

  const node = await service.getNodeVersions(user, system, nodeId);

  return c.json(node);
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

  try {
    const node = await service.createNode(buffer, bytes);
    return c.json(node);
  } catch (error) {
    if (error instanceof Error && "code" in error) {
      switch (error.code) {
        case "23505":
          throw new HTTPException(409, { message: "node already exists" });
      }
    }
  }
  throw new HTTPException(500);
});

export { nodeRouter };
