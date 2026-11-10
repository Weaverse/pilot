import type { ProductFilter } from "@shopify/hydrogen";
import { CollectionProvider, useCollection } from "@shopify/hydrogen/react";
import type { ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router";

/**
 * Hydrogen 2026.10.2 writes category filters as `filter.p.category`, but
 * `parseCollectionParams` doesn't read that key, so the store would drop them
 * on its next URL sync. Pilot keeps them out of the store and in the URL.
 */
const CATEGORY_PARAM = "filter.p.category";

/** Category filters from the `filter.p.category` URL params. */
export function parseCategoryFilters(
  searchParams: URLSearchParams,
): ProductFilter[] {
  return searchParams
    .getAll(CATEGORY_PARAM)
    .map((id) => ({ category: { id } }));
}

/**
 * Hydrogen's collection store for a product listing: filters and sort live in
 * the URL (`filter.p.*`/`filter.v.*`, `sort_by`), changes navigate client-side,
 * and `useCollection().status` reads `loading` until the loader catches up.
 * Pages are not part of the store: `Pagination` keeps the `after`/`before`
 * cursors, which the store drops on every filter or sort change.
 */
export function CollectionBrowseProvider({
  handle,
  dataSearch,
  children,
}: {
  handle: string;
  /** The search string the loader queried products for. */
  dataSearch: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storeSearch = new URLSearchParams(searchParams);
  storeSearch.delete(CATEGORY_PARAM);

  return (
    <CollectionProvider
      data={{ handle, dataSearch }}
      urlSearch={storeSearch.toString()}
      onChange={(search) => {
        const next = new URLSearchParams(search);
        for (const id of searchParams.getAll(CATEGORY_PARAM)) {
          next.append(CATEGORY_PARAM, id);
        }
        navigate({ search: `?${next}` }, { preventScrollReset: true });
      }}
    >
      {children}
    </CollectionProvider>
  );
}

/** The store's filters plus the category filters it can't hold. */
export function useActiveFilters(): ProductFilter[] {
  const filters = useCollection((state) => state.filters);
  const [searchParams] = useSearchParams();
  return [...filters, ...parseCategoryFilters(searchParams)];
}

/** Adds or removes a category filter in the URL, from the first page. */
export function useToggleCategoryFilter() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return function toggleCategoryFilter(id: string) {
    const next = new URLSearchParams(searchParams);
    const ids = next.getAll(CATEGORY_PARAM);
    next.delete(CATEGORY_PARAM);
    for (const value of ids.includes(id)
      ? ids.filter((v) => v !== id)
      : [...ids, id]) {
      next.append(CATEGORY_PARAM, value);
    }
    next.delete("after");
    next.delete("before");
    navigate({ search: `?${next}` }, { preventScrollReset: true });
  };
}
