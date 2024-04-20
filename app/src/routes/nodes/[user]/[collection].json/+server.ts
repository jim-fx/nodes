import { json } from "@sveltejs/kit";
import type { EntryGenerator, RequestHandler } from "./$types";
import * as registry from "$lib/node-registry";

export const prerender = true;

export const entries: EntryGenerator = async () => {
  const users = await registry.getUsers();
  return users.map(user => {
    return user.collections.map(collection => {
      return { user: user.id, collection: collection.id }
    })
  }).flat(2);
}

export const GET: RequestHandler = async function GET({ params }) {

  const namespaces = await registry.getCollection(`${params.user}/${params.collection}`);

  return json(namespaces);

}
