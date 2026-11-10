import {
  type ProductFilter,
  serializeCollectionParams,
} from "@shopify/hydrogen";
import { type Locale, priceLocaleFor } from "~/utils/locale";

/** Pilot's pre-2026.10 `sort` values, as their Liquid-compatible `sort_by` value. */
const LEGACY_SORT_BY: Record<string, string | undefined> = {
  "price-low-high": "price-ascending",
  "price-high-low": "price-descending",
  "best-selling": "best-selling",
  newest: "created-descending",
  // Featured and relevance are the listing's default order.
  featured: undefined,
  relevance: undefined,
};

/**
 * Converts Pilot's pre-2026.10 browse URLs (`filter.<field>=<json>`, `sort=`,
 * `cursor`/`direction`) to the Liquid-compatible params Hydrogen's collection
 * store reads (`filter.p.*`/`filter.v.*`, `sort_by`). Returns the new search
 * string to redirect to, or `null` when the URL has no legacy params.
 */
export function getLegacyBrowseRedirect(url: URL): string | null {
  const params = new URLSearchParams(url.search);
  const filters: ProductFilter[] = [];
  let legacy = false;

  for (const [key, value] of url.searchParams) {
    // Liquid-compatible keys are `filter.p.*` and `filter.v.*`.
    const field = key.match(/^filter\.(?!p\.|v\.)(.+)$/)?.[1];
    if (!field) {
      continue;
    }
    legacy = true;
    params.delete(key);
    try {
      filters.push({ [field]: JSON.parse(value) } as ProductFilter);
    } catch {
      // Not a legacy JSON value: drop it.
    }
  }
  for (const [key, value] of serializeCollectionParams({
    filters,
    sortKey: undefined,
    reverse: false,
  })) {
    params.append(key, value);
  }

  const sort = url.searchParams.get("sort");
  if (sort !== null) {
    legacy = true;
    params.delete("sort");
    const sortBy = LEGACY_SORT_BY[sort];
    if (sortBy && !params.has("sort_by")) {
      params.set("sort_by", sortBy);
    }
  }

  if (!legacy) {
    return null;
  }
  // Old cursors belong to the old filters and sort: start from the first page.
  params.delete("cursor");
  params.delete("direction");
  const search = params.toString();
  return `${url.pathname}${search ? `?${search}` : ""}`;
}

export function parseAsCurrency(value: number, locale: Locale) {
  // Same tag as `<Money>`, so filter labels match the prices on the page.
  return new Intl.NumberFormat(priceLocaleFor(locale), {
    style: "currency",
    currency: locale.currency,
  }).format(value);
}
