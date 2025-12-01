import { createWasmWrapper } from "@nodarium/utils";
import fs from "fs/promises";
import path from "path";

export async function getWasm(id: `${string}/${string}/${string}`) {
  const filePath = path.resolve(`../nodes/${id}/pkg/index_bg.wasm`);

  try {
    await fs.access(filePath);
  } catch (e) {
    return null;
  }

  const file = await fs.readFile(filePath);

  return new Uint8Array(file);
}

export async function getNodeWasm(id: `${string}/${string}/${string}`) {
  const wasmBytes = await getWasm(id);
  if (!wasmBytes) return null;

  const wrapper = createWasmWrapper(wasmBytes);

  return wrapper;
}

export async function getNode(id: `${string}/${string}/${string}`) {
  const wrapper = await getNodeWasm(id);

  const definition = wrapper?.get_definition?.();

  if (!definition) return null;

  return definition;
}

export async function getCollectionNodes(userId: `${string}/${string}`) {
  const nodes = await fs.readdir(path.resolve(`../nodes/${userId}`));
  return nodes
    .filter((n) => n !== "pkg" && n !== ".template")
    .map((n) => {
      return {
        id: `${userId}/${n}`,
      };
    });
}

export async function getCollection(userId: `${string}/${string}`) {
  const nodes = await getCollectionNodes(userId);
  return {
    id: userId,
    nodes,
  };
}

export async function getUserCollections(userId: string) {
  const collections = await fs.readdir(path.resolve(`../nodes/${userId}`));
  return Promise.all(
    collections.map(async (n) => {
      const nodes = await getCollectionNodes(`${userId}/${n}`);
      return {
        id: `${userId}/${n}`,
        nodes,
      };
    }),
  );
}

export async function getUser(userId: string) {
  const collections = await getUserCollections(userId);
  return {
    id: userId,
    collections,
  };
}

export async function getUsers() {
  const nodes = await fs.readdir(path.resolve("../nodes"));
  const users = await Promise.all(
    nodes.map(async (n) => {
      const collections = await getUserCollections(n);
      return {
        id: n,
        collections,
      };
    }),
  );
  return users;
}
