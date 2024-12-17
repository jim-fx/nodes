import * as path from "jsr:@std/path";
const arg = Deno.args[0];

const base = arg.startsWith("/") ? arg : path.join(Deno.cwd(), arg);

const dirs = Deno.readDir(base);

type Node = {
  user: string;
  system: string;
  id: string;
  path: string;
};

const nodes: Node[] = [];

for await (const dir of dirs) {
  if (dir.isDirectory) {
    const userDir = path.join(base, dir.name);
    for await (const userName of Deno.readDir(userDir)) {
      if (userName.isDirectory) {
        const nodeSystemDir = path.join(userDir, userName.name);
        for await (const nodeDir of Deno.readDir(nodeSystemDir)) {
          if (nodeDir.isDirectory && !nodeDir.name.startsWith(".")) {
            const wasmFilePath = path.join(
              nodeSystemDir,
              nodeDir.name,
              "pkg",
              "index_bg.wasm",
            );
            nodes.push({
              user: dir.name,
              system: userName.name,
              id: nodeDir.name,
              path: wasmFilePath,
            });
          }
        }
      }
    }
  }
}

async function postNode(node: Node) {
  const wasmContent = await Deno.readFile(node.path);

  const url = `http://localhost:8000/v1/nodes`;

  const res = await fetch(url, {
    method: "POST",
    body: wasmContent,
  });

  if (res.ok) {
    const json = await res.text();
    console.log(json);
  }
}

for (const node of nodes) {
  await postNode(node);
}
