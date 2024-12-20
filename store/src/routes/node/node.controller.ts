import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { idRegex, NodeDefinitionSchema } from "./validations/types.ts";
import * as service from "./node.service.ts";
import { bodyLimit } from "hono/body-limit";
import { ZodSchema } from "zod";
import { CustomError } from "./errors.ts";

const nodeRouter = new OpenAPIHono();

const createParamSchema = (name: string) =>
  z
    .string()
    .min(3)
    .max(20)
    .refine(
      (value) => idRegex.test(value),
      `${name} must contain only letters, numbers, "-", or "_"`,
    )
    .openapi({ param: { name, in: "path" } });

const createResponseSchema = <T extends ZodSchema>(
  description: string,
  schema: T,
) => ({
  200: {
    content: { "application/json": { schema } },
    description,
  },
});

async function getNodeByVersion(
  user: string,
  system: string,
  nodeId: string,
  hash?: string,
) {
  console.log("Get Node by Version", { user, system, nodeId, hash });
  if (hash) {
    if (nodeId.includes("wasm")) {
      return await service.getNodeVersionWasm(
        user,
        system,
        nodeId.replace(".wasm", ""),
        hash,
      );
    } else {
      const wasmContent = await service.getNodeVersion(
        user,
        system,
        nodeId,
        hash,
      );
      return wasmContent;
    }
  } else {
    if (nodeId.includes(".wasm")) {
      const [id, version] = nodeId.replace(/\.wasm$/, "").split("@");
      console.log({ user, system, id, version });
      if (version) {
        return service.getNodeVersionWasm(
          user,
          system,
          id,
          version,
        );
      } else {
        return service.getNodeWasmById(
          user,
          system,
          id,
        );
      }
    } else {
      const [id, version] = nodeId.replace(/\.json$/, "").split("@");
      if (!version) {
        return service.getNodeDefinitionById(
          user,
          system,
          id,
        );
      } else {
        return await service.getNodeVersion(
          user,
          system,
          id,
          version,
        );
      }
    }
  }
}

nodeRouter.openapi(
  createRoute({
    method: "post",
    path: "/",
    responses: createResponseSchema(
      "Create a single node",
      NodeDefinitionSchema,
    ),
    middleware: [
      bodyLimit({
        maxSize: 128 * 1024, // 128 KB
        onError: (c) => c.text("Node content too large", 413),
      }),
    ],
  }),
  async (c) => {
    const buffer = await c.req.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    try {
      const node = await service.createNode(buffer, bytes);
      return c.json(node);
    } catch (error) {
      if (error instanceof CustomError) {
        throw new HTTPException(error.status, { message: error.message });
      }
      throw new HTTPException(500, { message: "Internal server error" });
    }
  },
);

nodeRouter.openapi(
  createRoute({
    method: "get",
    path: "/{user}.json",
    request: {
      params: z.object({
        user: createParamSchema("user").optional(),
      }),
    },
    responses: createResponseSchema(
      "Retrieve nodes for a user",
      z.array(NodeDefinitionSchema),
    ),
  }),
  async (c) => {
    const user = c.req.param("user.json").replace(/\.json$/, "");
    try {
      const nodes = await service.getNodeDefinitionsByUser(user);
      return c.json(nodes);
    } catch (error) {
      if (error instanceof CustomError) {
        throw new HTTPException(error.status, { message: error.message });
      }
      throw new HTTPException(500, { message: "Internal server error" });
    }
  },
);

nodeRouter.openapi(
  createRoute({
    method: "get",
    path: "/{user}/{system}.json",
    request: {
      params: z.object({
        user: createParamSchema("user"),
        system: createParamSchema("system").optional(),
      }),
    },
    responses: createResponseSchema(
      "Retrieve nodes for a system",
      z.array(NodeDefinitionSchema),
    ),
  }),
  async (c) => {
    const { user } = c.req.valid("param");
    const system = c.req.param("system.json").replace(/\.json$/, "");
    console.log("Get Nodes by System", { user, system });
    try {
      const nodes = await service.getNodesBySystem(user, system);
      return c.json(nodes);
    } catch (error) {
      if (error instanceof CustomError) {
        throw new HTTPException(error.status, { message: error.message });
      }
      throw new HTTPException(500, { message: "Internal server error" });
    }
  },
);

nodeRouter.openapi(
  createRoute({
    method: "get",
    path: "/{user}/{system}/{nodeId}.json",
    request: {
      params: z.object({
        user: createParamSchema("user"),
        system: createParamSchema("system"),
        nodeId: createParamSchema("nodeId").optional(),
      }),
    },
    responses: createResponseSchema(
      "Retrieve a single node definition",
      NodeDefinitionSchema,
    ),
  }),
  async (c) => {
    const { user, system } = c.req.valid("param");
    const nodeId = c.req.param("nodeId.json").replace(/\.json$/, "");
    console.log("Get Node by Id", { user, system, nodeId });
    try {
      const node = await service.getNodeDefinitionById(user, system, nodeId);
      return c.json(node);
    } catch (error) {
      if (error instanceof CustomError) {
        throw new HTTPException(error.status, { message: error.message });
      }
      throw new HTTPException(500, { message: "Internal server error" });
    }
  },
);

nodeRouter.openapi(
  createRoute({
    method: "get",
    path: "/{user}/{system}/{nodeId}@{version}.json",
    request: {
      params: z.object({
        user: createParamSchema("user"),
        system: createParamSchema("system"),
        nodeId: createParamSchema("nodeId"),
        version: createParamSchema("version").optional(),
      }),
    },
    responses: createResponseSchema(
      "Retrieve a single node definition",
      NodeDefinitionSchema,
    ),
  }),
  async (c) => {
    const { user, system, nodeId } = c.req.valid("param");
    const hash = c.req.param("version.json");
    try {
      const res = await getNodeByVersion(user, system, nodeId, hash);
      if (res instanceof ArrayBuffer) {
        c.header("Content-Type", "application/wasm");
        return c.body(res);
      } else {
        return c.json(res);
      }
    } catch (error) {
      if (error instanceof CustomError) {
        throw new HTTPException(error.status, { message: error.message });
      }
      throw new HTTPException(500, { message: "Internal server error" });
    }
  },
);

nodeRouter.openapi(
  createRoute({
    method: "get",
    path: "/{user}/{system}/{nodeId}/versions.json",
    request: {
      params: z.object({
        user: createParamSchema("user"),
        system: createParamSchema("system"),
        nodeId: createParamSchema("nodeId"),
      }),
    },
    responses: createResponseSchema(
      "Retrieve a single node definition",
      z.array(NodeDefinitionSchema),
    ),
  }),
  async (c) => {
    const { user, system, nodeId } = c.req.valid("param");

    try {
      const node = await service.getNodeVersions(user, system, nodeId);

      return c.json(node);
    } catch (error) {
      if (error instanceof CustomError) {
        throw new HTTPException(error.status, { message: error.message });
      }
      throw new HTTPException(500, { message: "Internal server error" });
    }
  },
);

nodeRouter.openapi(
  createRoute({
    method: "get",
    path: "/{user}/{system}/{nodeId}.wasm",
    request: {
      params: z.object({
        user: createParamSchema("user"),
        system: createParamSchema("system"),
        nodeId: createParamSchema("nodeId").optional(),
      }),
    },
    responses: {
      200: {
        content: { "application/wasm": { schema: z.any() } },
        description: "Retrieve a node's WASM file",
      },
    },
  }),
  async (c) => {
    const { user, system } = c.req.valid("param");
    const nodeId = c.req.param("nodeId.wasm");
    console.log("Get NodeWasm by Id", { user, system, nodeId });
    try {
      const res = await getNodeByVersion(user, system, nodeId);
      if (res instanceof ArrayBuffer) {
        c.header("Content-Type", "application/wasm");
        return c.body(res);
      } else {
        return c.json(res);
      }
    } catch (error) {
      if (error instanceof CustomError) {
        throw new HTTPException(error.status, { message: error.message });
      }
      throw new HTTPException(500, { message: "Internal server error" });
    }
  },
);

nodeRouter.openapi(
  createRoute({
    method: "get",
    path: "/{user}/{system}/{nodeId}@{version}.wasm",
    request: {
      params: z.object({
        user: createParamSchema("user"),
        system: createParamSchema("system"),
        nodeId: createParamSchema("nodeId"),
        version: createParamSchema("version").optional(),
      }),
    },
    responses: {
      200: {
        content: { "application/wasm": { schema: z.any() } },
        description: "Retrieve a node's WASM file",
      },
    },
  }),
  async (c) => {
    const { user, system, nodeId } = c.req.valid("param");
    const hash = c.req.param("version.wasm");
    try {
      const res = await getNodeByVersion(user, system, nodeId, hash);
      if (res instanceof ArrayBuffer) {
        c.header("Content-Type", "application/wasm");
        return c.body(res);
      } else {
        return c.json(res);
      }
    } catch (error) {
      if (error instanceof CustomError) {
        throw new HTTPException(error.status, { message: error.message });
      }
      throw new HTTPException(500, { message: "Internal server error" });
    }
  },
);

export { nodeRouter };
