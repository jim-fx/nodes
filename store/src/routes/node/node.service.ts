import { db } from "../../db/db.ts";
import { nodeTable } from "./node.schema.ts";
import { NodeDefinition, NodeDefinitionSchema } from "./types.ts";
import { and, eq } from "drizzle-orm";

export type CreateNodeDTO = {
  id: string;
  system: string;
  user: string;
  content: ArrayBuffer;
};

function extractDefinition(content: ArrayBuffer): Promise<NodeDefinition> {
  const worker = new Worker(new URL("./node.worker.ts", import.meta.url).href, {
    type: "module",
  });

  return new Promise((res, rej) => {
    worker.postMessage({ action: "extract-definition", content });
    setTimeout(() => {
      worker.terminate();
      rej(new Error("Worker timeout out"));
    }, 100);
    worker.onmessage = function (e) {
      console.log(e.data);
      switch (e.data.action) {
        case "result":
          res(e.data.result);
          break;
        case "error":
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
      content: content,
    };

    await db.insert(nodeTable).values(node);
    console.log("New user created!");
    // await db.insert(users).values({ name: "Andrew" });
    return def;
  } catch (error) {
    console.log({ error });
    throw error;
  }
}

export async function getNodesByUser(userName: string) {}
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

export async function getNodeById(dto: CreateNodeDTO) {}
