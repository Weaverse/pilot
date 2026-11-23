import { expect, test } from "@playwright/test";
import type { WeaverseLoaderData } from "@weaverse/hydrogen/react-router";
import { loadAppModule } from "../support/render-app";

/**
 * Which Weaverse loader data a page route renders and which it answers 404.
 *
 * The SDK flags its placeholder page with `isFallback` when no page is
 * assigned to the URL. Studio still needs that placeholder in design mode.
 */

type Validate = (data: WeaverseLoaderData | null) => void;

async function statusFor(data: unknown): Promise<number | "ok"> {
  const { validateWeaverseData } = await loadAppModule<{
    validateWeaverseData: Validate;
  }>("weaverse/index.tsx");
  try {
    validateWeaverseData(data as WeaverseLoaderData);
    return "ok";
  } catch (thrown) {
    return (thrown as Response).status;
  }
}

function loaderData(isFallback: boolean, isDesignMode = false) {
  return {
    page: { id: isFallback ? "fallback_page_1" : "page_1" },
    configs: { requestInfo: { queries: { isDesignMode } } },
    ...(isFallback ? { isFallback } : {}),
  };
}

test("an assigned page renders", async () => {
  expect(await statusFor(loaderData(false))).toBe("ok");
});

test("the placeholder page answers 404 outside design mode", async () => {
  expect(await statusFor(loaderData(true))).toBe(404);
});

test("the placeholder page renders in design mode", async () => {
  expect(await statusFor(loaderData(true, true))).toBe("ok");
});

test("missing loader data answers 404", async () => {
  expect(await statusFor(null)).toBe(404);
});
