import { db } from "../../db/db.ts";
import { nodeTable } from "./node.schema.ts";
import { NodeDefinition, NodeDefinitionSchema } from "./validations/types.ts";
import { and, eq } from "drizzle-orm";
import { createHash } from "node:crypto";
import { WorkerMessage } from "./worker/messages.ts";

export type CreateNodeDTO = {
  id: string;
  system: string;
  user: string;
  content: ArrayBuffer;
};

function getNodeHash(content: Uint8Array) {
  const hash = createHash("sha256");
  hash.update(content);
  return hash.digest("hex").slice(0, 8);
}

function extractDefinition(content: ArrayBuffer): Promise<NodeDefinition> {
  const worker = new Worker(
    new URL("./worker/node.worker.ts", import.meta.url).href,
    {
      type: "module",
    },
  ) as Worker & {
    postMessage: (message: WorkerMessage) => void;
  };

  return new Promise((res, rej) => {
    worker.postMessage({ action: "extract-definition", content });
    setTimeout(() => {
      worker.terminate();
      rej(new Error("Worker timeout out"));
    }, 100);
    worker.onmessage = function (e) {
      switch (e.data.action) {
        case "result":
          res(e.data.result);
          break;
        case "error":
          console.log("Worker error", e.data.error);
          rej(e.data.result);
          break;
        default:
          rej(new Error("Unknown worker response"));
      }
    };
  });
}

export async function createNode(
  wasmBuffer: ArrayBuffer,
  content: Uint8Array,
): Promise<NodeDefinition> {
  try {
    const def = await extractDefinition(wasmBuffer);

    const [userId, systemId, nodeId] = def.id.split("/");

    const node: typeof nodeTable.$inferInsert = {
      userId,
      systemId,
      nodeId,
      definition: def,
      hash: getNodeHash(content),
      content: content,
    };

    await db.insert(nodeTable).values(node);
    console.log("new node created!");
    return def;
  } catch (error) {
    console.log("Creation Error", { error });
    throw error;
  }
}

export function getNodeDefinitionsByUser(userName: string) {
  return db.select({ definition: nodeTable.definition }).from(nodeTable)
    .where(
      and(
        eq(nodeTable.userId, userName),
      ),
    );
}

export async function getNodesBySystem(
  username: string,
  systemId: string,
): Promise<NodeDefinition[]> {
  const nodes = await db
    .select()
    .from(nodeTable)
    .where(
      and(eq(nodeTable.systemId, systemId), eq(nodeTable.userId, username)),
    );

  const definitions = nodes
    .map((node) => NodeDefinitionSchema.safeParse(node.definition))
    .filter((v) => v.success)
    .map((v) => v.data);

  return definitions;
}

export async function getNodeWasmById(
  userName: string,
  systemId: string,
  nodeId: string,
) {
  const a = performance.now();
  const node = await db.select({ content: nodeTable.content }).from(nodeTable)
    .where(
      and(
        eq(nodeTable.userId, userName),
        eq(nodeTable.systemId, systemId),
        eq(nodeTable.nodeId, nodeId),
      ),
    ).limit(1).execute();
  console.log("Time to load wasm", performance.now() - a);

  if (!node[0]) {
    throw new Error("Node not found");
  }

  return node[0].content;
}

export async function getNodeDefinitionById(
  userName: string,
  systemId: string,
  nodeId: string,
) {
  const node = await db.select({ definition: nodeTable.definition }).from(
    nodeTable,
  ).where(
    and(
      eq(nodeTable.userId, userName),
      eq(nodeTable.systemId, systemId),
      eq(nodeTable.nodeId, nodeId),
    ),
  ).limit(1);

  if (!node[0]) {
    return;
  }

  const definition = NodeDefinitionSchema.safeParse(node[0]?.definition);

  if (!definition.data) {
    throw new Error("Invalid definition");
  }

  return definition.data;
}
