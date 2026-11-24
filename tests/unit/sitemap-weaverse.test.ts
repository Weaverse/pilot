import { expect, test } from "@playwright/test";
import type { LoaderFunctionArgs } from "react-router";
import { loader } from "../../app/routes/seo/sitemap-weaverse.xml";

function args(fetchCustomPages: () => Promise<unknown>) {
  return {
    request: new Request("https://shop.test/sitemap-weaverse.xml"),
    context: { weaverse: { fetchCustomPages } },
    params: {},
  } as unknown as LoaderFunctionArgs;
}

test("should_answer_503_without_caching_when_custom_pages_fail_to_load", async () => {
  const failing = () => Promise.reject(new Error("Weaverse API down"));
  const silence = console.error;
  console.error = () => {};

  const response = await loader(args(failing));
  console.error = silence;

  expect(response.status).toBe(503);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
});

test("should_list_custom_pages_when_they_load", async () => {
  const pages = () =>
    Promise.resolve([
      { path: "/about", lastModified: "2026-11-01T00:00:00.000Z" },
    ]);

  const response = await loader(args(pages));

  expect(await response.text()).toContain("<loc>https://shop.test/about</loc>");
});
