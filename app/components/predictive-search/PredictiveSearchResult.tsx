import { Link } from "@remix-run/react";
import { SearchResultItem } from "./ResultItem";
import type {
  NormalizedPredictiveSearchResultItem,
  NormalizedPredictiveSearchResults,
  SearchResultTypeProps,
} from "./types";
import clsx from "clsx";

export function PredictiveSearchResult({
  goToSearchResult,
  items,
  searchTerm,
  type,
}: SearchResultTypeProps) {
  let isSuggestions = type === "queries";
  let categoryUrl = `/search?q=${
    searchTerm.current
  }&type=${pluralToSingularSearchType(type)}`;

  return (
    <div
      className="predictive-search-result flex flex-col gap-4 divide-y divide-bar-subtle"
      key={type}
    >
      <Link
        prefetch="intent"
        className="uppercase font-bold"
        to={categoryUrl}
        onClick={goToSearchResult}
      >
        {isSuggestions ? "Suggestions" : type}
      </Link>
      {items?.length && (
        <ul
          className={clsx(
            "pt-5",
            type === "products" ? "space-y-4" : "space-y-1",
          )}
        >
          {items.map((item: NormalizedPredictiveSearchResultItem) => (
            <SearchResultItem
              goToSearchResult={goToSearchResult}
              item={item}
              key={item.id}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Converts a plural search type to a singular search type
 *
 * @example
 * ```js
 * pluralToSingularSearchType('articles'); // => 'ARTICLE'
 * pluralToSingularSearchType(['articles', 'products']); // => 'ARTICLE,PRODUCT'
 * ```
 */
function pluralToSingularSearchType(
  type:
    | NormalizedPredictiveSearchResults[number]["type"]
    | Array<NormalizedPredictiveSearchResults[number]["type"]>,
) {
  let plural = {
    articles: "ARTICLE",
    collections: "COLLECTION",
    pages: "PAGE",
    products: "PRODUCT",
    queries: "QUERY",
  };

  if (typeof type === "string") {
    return plural[type];
  }

  return type.map((t) => plural[t]).join(",");
}
