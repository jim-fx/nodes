import type { RequestHandler } from "./$types";
import fs from "fs/promises";
import path from "path";

export const GET: RequestHandler = async function GET({ fetch, params }) {

  const filePath = path.resolve(`../../nodes/${params.user}/${params.collection}/${params.node}/pkg/index_bg.wasm`);

  try {
    await fs.access(filePath);
  } catch (e) {
    return new Response("Not found", { status: 404 });
  }

  const file = await fs.readFile(filePath);

  const bytes = new Uint8Array(file);

  return new Response(bytes, { status: 200, headers: { "Content-Type": "application/wasm" } });
}
