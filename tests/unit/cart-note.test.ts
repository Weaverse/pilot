import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import {
  getInvalidCartNoteResult,
  getSuccessfulCartNote,
  hasCartResponseErrors,
  normalizeCartNote,
  updateCartNote,
} from "../../app/utils/cart-note";

const PROJECT_ROOT = new URL("../../", import.meta.url);
const ADD_TO_CART_SURFACES = [
  "app/components/product-card/quick-shop.tsx",
  "app/sections/main-product/buy-buttons/index.tsx",
  "app/sections/main-product/buy-buttons/sticky-atc-bar.tsx",
  "app/sections/single-product/index.tsx",
];
const MALFORMED_CART_NOTES: [string, unknown][] = [
  ["missing", undefined],
  ["null", null],
  ["numeric", 42],
  ["array", ["note"]],
  ["object", { note: "note" }],
  ["boolean", true],
];

test.describe("cart note updates", () => {
  test("normalizes only an all-whitespace note to the empty string", () => {
    expect(normalizeCartNote("")).toBe("");
    expect(normalizeCartNote(" \n\t ")).toBe("");
    expect(normalizeCartNote("  Gift note  ")).toBe("  Gift note  ");
  });

  test("sends the normalized note and cart options to Hydrogen", async () => {
    const calls: { note: string; options: unknown }[] = [];
    const cart = {
      async updateNote(note, cartOptions) {
        calls.push({ note, options: cartOptions });
        return { cart: { id: "gid://shopify/Cart/1", note } };
      },
    };
    const options = { cartId: "gid://shopify/Cart/1" };

    await updateCartNote(cart, "Added note", options);
    await updateCartNote(cart, "Replacement note", options);
    await updateCartNote(cart, " \n\t ", options);

    expect(calls).toEqual([
      { note: "Added note", options },
      { note: "Replacement note", options },
      { note: "", options },
    ]);
  });

  for (const [name, note] of MALFORMED_CART_NOTES) {
    test(`returns a controlled response for ${name} input`, async () => {
      let calls = 0;
      const cart = {
        async updateNote() {
          calls += 1;
          return { cart: { id: "gid://shopify/Cart/1" } };
        },
      };

      expect(await updateCartNote(cart, note)).toEqual(
        getInvalidCartNoteResult(),
      );
      expect(calls).toBe(0);
    });
  }

  test("accepts only an error-free authoritative cart note", () => {
    expect(
      getSuccessfulCartNote({
        cart: { id: "gid://shopify/Cart/1", note: "Added note" },
        errors: [],
        userErrors: [],
      }),
    ).toBe("Added note");
    expect(
      getSuccessfulCartNote({
        cart: { id: "gid://shopify/Cart/1", note: "Replacement note" },
      }),
    ).toBe("Replacement note");
    expect(
      getSuccessfulCartNote({
        cart: { id: "gid://shopify/Cart/1", note: null },
      }),
    ).toBe("");
  });

  test("rejects user errors, GraphQL errors, network failure, and missing cart data", () => {
    expect(
      getSuccessfulCartNote({
        cart: { id: "gid://shopify/Cart/1", note: "Not saved" },
        userErrors: [{ message: "Rejected" }],
      }),
    ).toBeUndefined();
    expect(
      getSuccessfulCartNote({
        cart: { id: "gid://shopify/Cart/1", note: "Not saved" },
        errors: [{ message: "GraphQL failed" }],
      }),
    ).toBeUndefined();
    expect(getSuccessfulCartNote(undefined)).toBeUndefined();
    expect(getSuccessfulCartNote({ userErrors: [] })).toBeUndefined();
    expect(
      getSuccessfulCartNote({ cart: { id: "gid://shopify/Cart/1" } }),
    ).toBeUndefined();
  });

  test("a successful retry is accepted after a failed response", () => {
    const failed = {
      cart: { id: "gid://shopify/Cart/1", note: "Old note" },
      userErrors: [{ message: "Try again" }],
    };
    const retried = {
      cart: { id: "gid://shopify/Cart/1", note: "Retried note" },
      userErrors: [],
    };

    expect(getSuccessfulCartNote(failed)).toBeUndefined();
    expect(getSuccessfulCartNote(retried)).toBe("Retried note");
  });
});

test.describe("cart response error gating", () => {
  test("accepts responses without errors", () => {
    expect(hasCartResponseErrors(undefined)).toBe(false);
    expect(hasCartResponseErrors({})).toBe(false);
    expect(hasCartResponseErrors({ errors: [], userErrors: [] })).toBe(false);
  });

  test("rejects GraphQL and user error responses", () => {
    expect(
      hasCartResponseErrors({ errors: [{ message: "GraphQL failed" }] }),
    ).toBe(true);
    expect(
      hasCartResponseErrors({ userErrors: [{ message: "Rejected" }] }),
    ).toBe(true);
  });

  test("both cart fetcher paths use the shared error gate", async () => {
    const sources = await Promise.all(
      ["cart-sync.ts", "cart-baseline.ts"].map((file) =>
        readFile(new URL(`app/components/cart/${file}`, PROJECT_ROOT), "utf8"),
      ),
    );
    expect(
      sources.join("\n").match(/hasCartResponseErrors\(fetcherData\)/g)?.length,
    ).toBe(2);
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

  test("Hydrogen Analytics.Provider remains the canonical owner", async () => {
    const source = await readFile(
      new URL("app/root.tsx", PROJECT_ROOT),
      "utf8",
    );
    expect(source).toMatch(/<Analytics\.Provider\b/);
  });
});
