import type { ProductFilter } from "@shopify/hydrogen/storefront-api-types";
import type { Location, useLocation } from "react-router";

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
  const paramsClone = new URLSearchParams(params);
  for (const [k, v] of Object.entries(filter)) {
    paramsClone.delete(FILTER_URL_PREFIX + k, JSON.stringify(v));
  }
  return `${location.pathname}?${paramsClone.toString()}`;
}

export function getFilterLink(
  input: string | ProductFilter,
  params: URLSearchParams,
  location: ReturnType<typeof useLocation>,
) {
  const paramsClone = new URLSearchParams(params);
  const newParams = filterInputToParams(input, paramsClone);
  return `${location.pathname}?${newParams.toString()}`;
}

export function filterInputToParams(
  input: string | ProductFilter,
  params: URLSearchParams,
) {
  const filter =
    typeof input === "string" ? (JSON.parse(input) as ProductFilter) : input;

  for (const [k, v] of Object.entries(filter)) {
    const key = `${FILTER_URL_PREFIX}${k}`;
    const value = JSON.stringify(v);
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
