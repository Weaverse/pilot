import { expect, test } from "@playwright/test";
import { collectionProductsCount } from "../../app/components/root/analytics-views";

const nodes = [{}, {}];
const AVAILABILITY = [
  { count: 30, input: '{"available":true}' },
  { count: 4, input: '{"available":false}' },
];

test("should_count_products_from_the_availability_filter", () => {
  const count = collectionProductsCount({
    nodes,
    filters: [
      { id: "filter.p.vendor", values: [{ count: 99, input: "{}" }] },
      { id: "filter.v.availability", values: AVAILABILITY },
    ],
  });

  expect(count).toBe(34);
});

test("should_fall_back_to_loaded_products_without_availability_filter", () => {
  expect(collectionProductsCount({ nodes, filters: [] })).toBe(2);
});

test("should_count_only_the_active_availability_values", () => {
  const products = {
    nodes,
    filters: [{ id: "filter.v.availability", values: AVAILABILITY }],
  };

  expect(collectionProductsCount(products, [{ available: true }])).toBe(30);
  expect(collectionProductsCount(products, [{ available: false }])).toBe(4);
});
