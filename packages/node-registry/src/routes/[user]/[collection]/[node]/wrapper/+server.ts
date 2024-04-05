import type { RequestHandler } from "./$types";
import fs from "fs/promises";
import path from "path";

export const GET: RequestHandler = async function GET({ params }) {

  const filePath = path.resolve(`../../nodes/${params.user}/${params.collection}/${params.node}/pkg/index_bg.js`);

  const file = await fs.readFile(filePath);

  return new Response(file, { status: 200, headers: { "Content-Type": "text/javascript" } });
}
