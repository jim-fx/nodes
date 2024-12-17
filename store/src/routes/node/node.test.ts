import { expect } from "jsr:@std/expect";
import { router } from "../router.ts";

Deno.test("simple test", async () => {
  const res = await router.request("/max/plants/test.json");
  const json = await res.text();
  console.log({ json });

  expect(true).toEqual(true);

  expect(json).toEqual({ hello: "world" });
});
