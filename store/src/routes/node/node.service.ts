import { db } from "../../db/db.ts";
import { nodeTable } from "./node.schema.ts";
import { NodeDefinition, NodeDefinitionSchema } from "./validations/types.ts";
import { and, asc, eq } from "drizzle-orm";
import { createHash } from "node:crypto";
import { extractDefinition } from "./worker/index.ts";
import { InvalidNodeDefinitionError, NodeNotFoundError } from "./errors.ts";

export type CreateNodeDTO = {
  id: string;
  system: string;
  user: string;
  content: ArrayBuffer;
};

function getNodeHash(content: Uint8Array) {
  const hash = createHash("sha256");
  hash.update(content);
  return hash.digest("hex").slice(0, 16);
}

export async function createNode(
  wasmBuffer: ArrayBuffer,
  content: Uint8Array,
): Promise<NodeDefinition> {
  const def = await extractDefinition(wasmBuffer);

  const [userId, systemId, nodeId] = def.id.split("/");

  const hash = getNodeHash(content);

  const node: typeof nodeTable.$inferInsert = {
    userId,
    systemId,
    nodeId,
    definition: def,
    hash,
    content: content,
  };

  const previousNode = await db
    .select({ hash: nodeTable.hash })
    .from(nodeTable)
    .orderBy(asc(nodeTable.createdAt))
    .limit(1);

  if (previousNode[0]) {
    node.previous = previousNode[0].hash;
  }

  await db.insert(nodeTable).values(node);
  return def;
}

export async function getNodeDefinitionsByUser(userName: string) {
  const nodes = await db
    .select({
      definition: nodeTable.definition,
      hash: nodeTable.hash,
    })
    .from(nodeTable)
    .where(and(eq(nodeTable.userId, userName)));

  return nodes.map((n) => ({
    ...n.definition,
    // id: n.definition.id + "@" + n.hash,
  }));
}

export async function getNodesBySystem(
  username: string,
  systemId: string,
): Promise<NodeDefinition[]> {
  const nodes = await db
    .selectDistinctOn(
      [nodeTable.userId, nodeTable.systemId, nodeTable.nodeId],
      { definition: nodeTable.definition, hash: nodeTable.hash },
    )
    .from(nodeTable)
    .where(
      and(eq(nodeTable.systemId, systemId), eq(nodeTable.userId, username)),
    )
    .orderBy(nodeTable.userId, nodeTable.systemId, nodeTable.nodeId);

  const definitions = nodes
    .map(
      (node) =>
        [NodeDefinitionSchema.safeParse(node.definition), node.hash] as const,
    )
    .filter(([v]) => v.success)
    .map(([v, hash]) => ({
      ...v.data,
      // id: v?.data?.id + "@" + hash,
    }));

  return definitions;
}

export async function getNodeWasmById(
  userName: string,
  systemId: string,
  nodeId: string,
) {
  const node = await db
    .select({ content: nodeTable.content })
    .from(nodeTable)
    .where(
      and(
        eq(nodeTable.userId, userName),
        eq(nodeTable.systemId, systemId),
        eq(nodeTable.nodeId, nodeId),
      ),
    )
    .orderBy(asc(nodeTable.createdAt))
    .limit(1);

  if (!node[0]) {
    throw new NodeNotFoundError();
  }

  return node[0].content;
}

export async function getNodeDefinitionById(
  userName: string,
  systemId: string,
  nodeId: string,
) {
  const node = await db
    .select({
      definition: nodeTable.definition,
      hash: nodeTable.hash,
    })
    .from(nodeTable)
    .where(
      and(
        eq(nodeTable.userId, userName),
        eq(nodeTable.systemId, systemId),
        eq(nodeTable.nodeId, nodeId),
      ),
    )
    .orderBy(asc(nodeTable.createdAt))
    .limit(1);

  if (!node[0]) {
    throw new NodeNotFoundError();
  }

  const definition = NodeDefinitionSchema.safeParse(node[0]?.definition);

  if (!definition.success) {
    throw new InvalidNodeDefinitionError();
  }

  return {
    ...definition.data,
    // id: definition.data.id + "@" + node[0].hash
  };
}

export async function getNodeVersions(
  user: string,
  system: string,
  nodeId: string,
) {
  const nodes = await db
    .select({
      definition: nodeTable.definition,
      hash: nodeTable.hash,
    })
    .from(nodeTable)
    .where(
      and(
        eq(nodeTable.userId, user),
        eq(nodeTable.systemId, system),
        eq(nodeTable.nodeId, nodeId),
      ),
    )
    .orderBy(asc(nodeTable.createdAt));

  return nodes.map((node) => ({
    ...node.definition,
    // id: node.definition.id + "@" + node.hash,
  }));
}

export async function getNodeVersion(
  user: string,
  system: string,
  nodeId: string,
  hash: string,
) {
  const nodes = await db
    .select({
      definition: nodeTable.definition,
    })
    .from(nodeTable)
    .where(
      and(
        eq(nodeTable.userId, user),
        eq(nodeTable.systemId, system),
        eq(nodeTable.nodeId, nodeId),
        eq(nodeTable.hash, hash),
      ),
    )
    .limit(1);

  if (nodes.length === 0) {
    throw new NodeNotFoundError();
  }

  return nodes[0].definition;
}

export async function getNodeVersionWasm(
  user: string,
  system: string,
  nodeId: string,
  hash: string,
) {
  const node = await db
    .select({
      content: nodeTable.content,
    })
    .from(nodeTable)
    .where(
      and(
        eq(nodeTable.userId, user),
        eq(nodeTable.systemId, system),
        eq(nodeTable.nodeId, nodeId),
        eq(nodeTable.hash, hash),
      ),
    )
    .limit(1);

  if (node.length === 0) {
    throw new NodeNotFoundError();
  }

  return node[0].content;
}
