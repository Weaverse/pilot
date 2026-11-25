import { expect, test } from "@playwright/test";
import type { LoaderFunctionArgs } from "react-router";
import { loader } from "../../app/routes/seo/sitemap-weaverse.xml";
import { createTestContext } from "../support/hydrogen-env";

const SITEMAP_URL = "https://shop.test/sitemap-weaverse.xml";

/**
 * Runs the route against the real request context (and its real Weaverse
 * client), answering only the custom-pages endpoint with `customPages`.
 */
async function loadSitemap(customPages: () => Response | Promise<Response>) {
  const realFetch = globalThis.fetch;
  const realError = console.error;
  // Stubbed before the context exists: the clients keep the `fetch` they were
  // built with.
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input instanceof Request ? input.url : input);
    return url.includes("/custom-pages") ? customPages() : Response.json({});
  }) as typeof globalThis.fetch;
  console.error = () => {};
  try {
    const context = await createTestContext(SITEMAP_URL);
    return await loader({
      request: new Request(SITEMAP_URL),
      context,
      params: {},
    } as unknown as LoaderFunctionArgs);
  } finally {
    globalThis.fetch = realFetch;
    console.error = realError;
  }
}

test("should_answer_503_without_caching_when_weaverse_fails", async () => {
  const response = await loadSitemap(() => {
    throw new TypeError("fetch failed");
  });

  expect(response.status).toBe(503);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
});

test("should_list_custom_pages_when_weaverse_answers", async () => {
  const response = await loadSitemap(() =>
    Response.json({
      data: [{ path: "/about", lastModified: "2026-11-01T00:00:00.000Z" }],
      nextCursor: null,
    }),
  );

  expect(await response.text()).toContain("<loc>https://shop.test/about</loc>");
});
