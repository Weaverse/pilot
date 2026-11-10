import { CollectionProvider } from "@shopify/hydrogen/react";
import type { ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router";

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

  return (
    <CollectionProvider
      data={{ handle, dataSearch }}
      urlSearch={searchParams.toString()}
      onChange={(search) => navigate({ search }, { preventScrollReset: true })}
    >
      {children}
    </CollectionProvider>
  );
}
