import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getNode } from "$lib/registry";

export const GET: RequestHandler = async function GET({ fetch, params }) {
  globalThis.fetch = fetch;

  const nodeId = `${params.user}/${params.collection}/${params.node}` as const;

  try {
    const node = await getNode(nodeId);
    return json(node);
  } catch (err) {
    console.log(err)
    return new Response("Not found", { status: 404 });
  }
}
