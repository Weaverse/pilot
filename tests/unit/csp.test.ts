import { expect, test } from "@playwright/test";
import { getCspDirectives } from "../../app/weaverse/csp";

const STOREFRONT = "https://shop.test/products/hoodie";

test("a visitor's policy names no Weaverse or attacker origin", () => {
  const visitor = JSON.stringify(getCspDirectives(new Request(STOREFRONT)));
  const injected = JSON.stringify(
    getCspDirectives(
      new Request(
        `${STOREFRONT}?weaverseHost=https://evil.example&isDesignMode=true`,
      ),
    ),
  );

  expect(visitor).not.toContain("weaverse");
  expect(injected).toBe(visitor);
});

test("Studio design mode adds only the trusted Studio origin", () => {
  const directives = getCspDirectives(
    new Request(
      `${STOREFRONT}?weaverseHost=https://studio.weaverse.io&isDesignMode=true`,
    ),
  );

  expect(directives.frameAncestors).toEqual(["https://studio.weaverse.io"]);
  expect(directives.scriptSrc).toContain("https://studio.weaverse.io");
  expect(directives.scriptSrc).toContain("'unsafe-eval'");
});

test("Shopify videos on the store's own domain are allowed media", () => {
  const directives = getCspDirectives(
    new Request(STOREFRONT),
    "checkout.example.com",
  );

  expect(directives.mediaSrc).toContain("https://checkout.example.com");
  expect(getCspDirectives(new Request(STOREFRONT)).mediaSrc).not.toContain(
    "https://checkout.example.com",
  );
});
