import { expect, test } from "@playwright/test";
import { collectionProductsCount } from "../../app/components/root/analytics-views";

const nodes = [{}, {}];

test("should_count_products_from_the_availability_filter", () => {
  const count = collectionProductsCount({
    nodes,
    filters: [
      { id: "filter.p.vendor", values: [{ count: 99 }] },
      { id: "filter.v.availability", values: [{ count: 30 }, { count: 4 }] },
    ],
  });

  expect(count).toBe(34);
});

test("should_fall_back_to_loaded_products_without_availability_filter", () => {
  expect(collectionProductsCount({ nodes, filters: [] })).toBe(2);
});
