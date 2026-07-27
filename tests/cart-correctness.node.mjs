import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, test } from "node:test";
import {
  getInvalidCartNoteResult,
  getSuccessfulCartNote,
  hasCartResponseErrors,
  normalizeCartNote,
  updateCartNote,
} from "../app/utils/cart-note.ts";

const PROJECT_ROOT = new URL("../", import.meta.url);
const ADD_TO_CART_SURFACES = [
  "app/components/product-card/quick-shop.tsx",
  "app/sections/main-product/buy-buttons/index.tsx",
  "app/sections/main-product/buy-buttons/sticky-atc-bar.tsx",
  "app/sections/single-product/index.tsx",
];
const MALFORMED_CART_NOTES = [
  ["missing", undefined],
  ["null", null],
  ["numeric", 42],
  ["array", ["note"]],
  ["object", { note: "note" }],
  ["boolean", true],
];

describe("cart note updates", () => {
  test("normalizes only an all-whitespace note to the empty string", () => {
    assert.equal(normalizeCartNote(""), "");
    assert.equal(normalizeCartNote(" \n\t "), "");
    assert.equal(normalizeCartNote("  Gift note  "), "  Gift note  ");
  });

  test("sends the normalized note and cart options to Hydrogen", async () => {
    const calls = [];
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

    assert.deepEqual(calls, [
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

      assert.deepEqual(
        await updateCartNote(cart, note),
        getInvalidCartNoteResult(),
      );
      assert.equal(calls, 0);
    });
  }

  test("accepts only an error-free authoritative cart note", () => {
    assert.equal(
      getSuccessfulCartNote({
        cart: { id: "gid://shopify/Cart/1", note: "Added note" },
        errors: [],
        userErrors: [],
      }),
      "Added note",
    );
    assert.equal(
      getSuccessfulCartNote({
        cart: { id: "gid://shopify/Cart/1", note: "Replacement note" },
      }),
      "Replacement note",
    );
    assert.equal(
      getSuccessfulCartNote({
        cart: { id: "gid://shopify/Cart/1", note: null },
      }),
      "",
    );
  });

  test("rejects user errors, GraphQL errors, network failure, and missing cart data", () => {
    assert.equal(
      getSuccessfulCartNote({
        cart: { id: "gid://shopify/Cart/1", note: "Not saved" },
        userErrors: [{ message: "Rejected" }],
      }),
      undefined,
    );
    assert.equal(
      getSuccessfulCartNote({
        cart: { id: "gid://shopify/Cart/1", note: "Not saved" },
        errors: [{ message: "GraphQL failed" }],
      }),
      undefined,
    );
    assert.equal(getSuccessfulCartNote(undefined), undefined);
    assert.equal(getSuccessfulCartNote({ userErrors: [] }), undefined);
    assert.equal(
      getSuccessfulCartNote({ cart: { id: "gid://shopify/Cart/1" } }),
      undefined,
    );
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

    assert.equal(getSuccessfulCartNote(failed), undefined);
    assert.equal(getSuccessfulCartNote(retried), "Retried note");
  });
});

describe("cart response error gating", () => {
  test("accepts responses without errors", () => {
    assert.equal(hasCartResponseErrors(undefined), false);
    assert.equal(hasCartResponseErrors({}), false);
    assert.equal(hasCartResponseErrors({ errors: [], userErrors: [] }), false);
  });

  test("rejects GraphQL and user error responses", () => {
    assert.equal(
      hasCartResponseErrors({ errors: [{ message: "GraphQL failed" }] }),
      true,
    );
    assert.equal(
      hasCartResponseErrors({ userErrors: [{ message: "Rejected" }] }),
      true,
    );
  });

  test("both cart fetcher paths use the shared error gate", async () => {
    const sources = await Promise.all(
      ["cart-sync.ts", "cart-baseline.ts"].map((file) =>
        readFile(new URL(`app/components/cart/${file}`, PROJECT_ROOT), "utf8"),
      ),
    );
    assert.equal(
      sources.join("\n").match(/hasCartResponseErrors\(fetcherData\)/g)?.length,
      2,
    );
  });
});

describe("add-to-cart analytics ownership", () => {
  test("all four add-to-cart surfaces use the shared button without an analytics prop", async () => {
    for (const file of ADD_TO_CART_SURFACES) {
      const source = await readFile(new URL(file, PROJECT_ROOT), "utf8");
      assert.match(source, /<AddToCartButton\b/);
      assert.doesNotMatch(
        source,
        /<AddToCartButton\b[\s\S]*?\banalytics\s*=/,
        `${file} must not activate a direct analytics sender`,
      );
    }
  });

  test("the shared button has no direct Shopify analytics sender", async () => {
    const source = await readFile(
      new URL("app/components/product/add-to-cart-button.tsx", PROJECT_ROOT),
      "utf8",
    );

    assert.doesNotMatch(
      source,
      /sendShopifyAnalytics|hasUserConsent|AddToCartAnalytics|name="analytics"|analytics\?:|\[key:\s*string\]:\s*any/,
    );
    assert.match(source, /Omit<\s*ButtonProps,/);
  });

  test("Hydrogen Analytics.Provider remains the canonical owner", async () => {
    const source = await readFile(
      new URL("app/root.tsx", PROJECT_ROOT),
      "utf8",
    );
    assert.match(source, /<Analytics\.Provider\b/);
  });
});
