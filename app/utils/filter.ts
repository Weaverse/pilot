import type { Location, useLocation } from "@remix-run/react";
import type { ProductFilter } from "@shopify/hydrogen/storefront-api-types";

export const FILTER_URL_PREFIX = "filter.";

export type AppliedFilter = {
  label: string;
  filter: ProductFilter;
};

export type SortParam =
  | "price-low-high"
  | "price-high-low"
  | "best-selling"
  | "newest"
  | "featured"
  | "relevance";

export function getAppliedFilterLink(
  { filter }: AppliedFilter,
  params: URLSearchParams,
  location: Location,
) {
  let paramsClone = new URLSearchParams(params);
  for (let [k, v] of Object.entries(filter)) {
    paramsClone.delete(FILTER_URL_PREFIX + k, JSON.stringify(v));
  }
  return `${location.pathname}?${paramsClone.toString()}`;
}

export function getFilterLink(
  input: string | ProductFilter,
  params: URLSearchParams,
  location: ReturnType<typeof useLocation>,
) {
  let paramsClone = new URLSearchParams(params);
  let newParams = filterInputToParams(input, paramsClone);
  return `${location.pathname}?${newParams.toString()}`;
}

export function filterInputToParams(
  input: string | ProductFilter,
  params: URLSearchParams,
) {
  let filter =
    typeof input === "string" ? (JSON.parse(input) as ProductFilter) : input;

  for (let [k, v] of Object.entries(filter)) {
    let key = `${FILTER_URL_PREFIX}${k}`;
    let value = JSON.stringify(v);
    if (params.has(key, value)) {
      return params;
    }
    if (k === "price") {
      // For price, we want to overwrite
      params.set(key, value);
    } else {
      params.append(key, value);
    }
  }

  return params;
}
