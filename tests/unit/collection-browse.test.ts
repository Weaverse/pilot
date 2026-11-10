import { expect, test } from "@playwright/test";
import { parseCollectionParams } from "@shopify/hydrogen";
import { getPaginationVariables } from "../../app/utils/pagination";
import { getLegacyBrowseRedirect } from "../../app/routes/collections/utils";

function legacy(path: string) {
  return getLegacyBrowseRedirect(new URL(path, "https://shop.test"));
}

test("pre-2026.10 filter and sort URLs redirect to Liquid-compatible params", () => {
  const target = legacy(
    `/de-de/collections/shoes?${new URLSearchParams([
      ["filter.productVendor", '"Nike"'],
      ["filter.variantOption", '{"name":"Color","value":"Red"}'],
      ["filter.price", '{"min":10,"max":50}'],
      ["filter.available", "true"],
      ["sort", "price-high-low"],
      ["cursor", "abc"],
      ["direction", "next"],
      ["utm_source", "mail"],
    ])}`,
  );
  expect(target).not.toBeNull();
  const url = new URL(target as string, "https://shop.test");

  expect(url.pathname).toBe("/de-de/collections/shoes");
  expect(url.searchParams.get("utm_source")).toBe("mail");
  expect(url.searchParams.has("cursor")).toBe(false);
  expect(url.searchParams.has("direction")).toBe(false);
  expect(parseCollectionParams(url.searchParams)).toEqual({
    filters: [
      { price: { min: 10, max: 50 } },
      { available: true },
      { productVendor: "Nike" },
      { variantOption: { name: "Color", value: "Red" } },
    ],
    sortKey: "PRICE",
    reverse: true,
  });
});

test("legacy default sorts drop the param", () => {
  expect(legacy("/collections/all?sort=featured")).toBe("/collections/all");
  expect(legacy("/products?sort=relevance&q=x")).toBe("/products?q=x");
  expect(legacy("/products?sort=newest")).toBe(
    "/products?sort_by=created-descending",
  );
});

test("current URLs do not redirect", () => {
  expect(
    legacy(
      "/collections/all?filter.p.vendor=Nike&filter.v.price.gte=10&sort_by=best-selling&after=abc",
    ),
  ).toBeNull();
  expect(legacy("/collections/all")).toBeNull();
});

test("pagination reads the after/before cursors", () => {
  const vars = (search: string) =>
    getPaginationVariables(new Request(`https://shop.test/products${search}`), {
      pageBy: 12,
    });

  expect(vars("")).toEqual({ first: 12, endCursor: null });
  expect(vars("?after=abc")).toEqual({ first: 12, endCursor: "abc" });
  expect(vars("?before=xyz")).toEqual({ last: 12, startCursor: "xyz" });
});
