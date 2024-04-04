import type { RequestHandler } from "./$types";
import fs from "fs/promises";

export const GET: RequestHandler = async function GET({ fetch, params }) {

  const path = `../../../../../../../../nodes/${params.user}/${params.collection}/${params.node}/pkg/${params.node}_bg.wasm`;

  const file = await fs.readFile(path);

  console.log({ file });


  const bytes = new Uint8Array([]);
  return new Response(bytes, { status: 200, headers: { "Content-Type": "application/wasm" } });
}
