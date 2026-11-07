import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { normalizeCartNote } from "../../app/utils/cart-note";
import {
  recordStorefrontCalls,
  type StorefrontCall,
  serverFetch,
} from "../support/hydrogen-env";

const PROJECT_ROOT = new URL("../../", import.meta.url);
const ADD_TO_CART_SURFACES = [
  "app/components/product-card/quick-shop.tsx",
  "app/sections/main-product/buy-buttons/index.tsx",
  "app/sections/main-product/buy-buttons/sticky-atc-bar.tsx",
  "app/sections/single-product/index.tsx",
];
const MALFORMED_CART_NOTES: [string, unknown][] = [
  ["null", null],
  ["numeric", 42],
  ["array", ["note"]],
  ["object", { note: "note" }],
  ["boolean", true],
];
const CART_ID = "gid://shopify/Cart/1";

/** Shopify's answer to every cart operation the note path sends. */
function respond({ operation, variables }: StorefrontCall) {
  if (operation === "PilotCartBuyerIdentity") {
    return {
      cartBuyerIdentityUpdate: { cart: { checkoutUrl: "" }, userErrors: [] },
    };
  }
  return {
    cartNoteUpdate: {
      cart: { id: CART_ID, note: variables.note },
      userErrors: [],
      warnings: [],
    },
  };
}

/**
 * Posts a note update to `/api/cart` through the worker, the way the cart
 * store (JSON) or the no-JS form (`intent=note-update`) sends it, and returns
 * the notes that reached Shopify.
 */
async function postNote(body: Record<string, unknown> | URLSearchParams) {
  const isForm = body instanceof URLSearchParams;
  const { result, calls } = await recordStorefrontCalls(
    () =>
      serverFetch(
        new Request("https://shop.test/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": isForm
              ? "application/x-www-form-urlencoded"
              : "application/json",
            Cookie: "cart=1",
            Origin: "https://shop.test",
            Referer: "https://shop.test/cart",
          },
          body: isForm ? body : JSON.stringify(body),
        }),
      ),
    respond,
  );
  return {
    response: result,
    notes: calls
      .filter((call) => call.operation !== "PilotCartBuyerIdentity")
      .map((call) => call.variables.note),
  };
}

test.describe("cart note updates", () => {
  test("normalizes only an all-whitespace note to the empty string", () => {
    expect(normalizeCartNote("")).toBe("");
    expect(normalizeCartNote(" \n\t ")).toBe("");
    expect(normalizeCartNote("  Gift note  ")).toBe("  Gift note  ");
  });

  test("sends the normalized note to Shopify", async () => {
    const sent: unknown[] = [];
    for (const note of ["Added note", "Replacement note", " \n\t "]) {
      const { response, notes } = await postNote({ note });
      expect(response.status).toBe(200);
      sent.push(...notes);
    }

    expect(sent).toEqual(["Added note", "Replacement note", ""]);
  });

  test("a no-JS note form is normalized the same way", async () => {
    const { response, notes } = await postNote(
      new URLSearchParams({ intent: "note-update", note: " \n\t " }),
    );

    // The form post lands back on the page it came from.
    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(response.status).toBeLessThan(400);
    expect(notes).toEqual([""]);
  });

  for (const [name, note] of MALFORMED_CART_NOTES) {
    test(`returns a controlled response for ${name} input`, async () => {
      const { response, notes } = await postNote({ note });

      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({
        error: { code: "invalid_cart_request" },
      });
      expect(notes).toEqual([]);
    });
  }

  test("a no-JS note form without a note is refused", async () => {
    const { response, notes } = await postNote(
      new URLSearchParams({ intent: "note-update" }),
    );

    expect(response.status).toBe(400);
    expect(notes).toEqual([]);
  });
});

test.describe("add-to-cart analytics ownership", () => {
  test("all four add-to-cart surfaces use the shared button without an analytics prop", async () => {
    for (const file of ADD_TO_CART_SURFACES) {
      const source = await readFile(new URL(file, PROJECT_ROOT), "utf8");
      expect(source).toMatch(/<AddToCartButton\b/);
      expect(
        source,
        `${file} must not activate a direct analytics sender`,
      ).not.toMatch(/<AddToCartButton\b[\s\S]*?\banalytics\s*=/);
    }
  });

  test("the shared button has no direct Shopify analytics sender", async () => {
    const source = await readFile(
      new URL("app/components/product/add-to-cart-button.tsx", PROJECT_ROOT),
      "utf8",
    );

    expect(source).not.toMatch(
      /sendShopifyAnalytics|hasUserConsent|AddToCartAnalytics|name="analytics"|analytics\?:|\[key:\s*string\]:\s*any/,
    );
    expect(source).toMatch(/Omit<\s*ButtonProps,/);
  });

  test("Shopify's analytics runtime remains the canonical owner", async () => {
    // Hydrogen 2026.10 has no `Analytics.Provider`: `ShopifyScripts` loads the
    // runtime and `useCartAnalytics` publishes cart events from the store, so
    // a button that sent its own would double-count every add.
    const root = await readFile(new URL("app/root.tsx", PROJECT_ROOT), "utf8");
    const views = await readFile(
      new URL("app/components/root/analytics-views.tsx", PROJECT_ROOT),
      "utf8",
    );
    expect(root).toMatch(/<ShopifyScripts\b/);
    expect(root).toMatch(/<CartAnalytics\b/);
    expect(views).toMatch(/useCartAnalytics\(\)/);
  });
});
