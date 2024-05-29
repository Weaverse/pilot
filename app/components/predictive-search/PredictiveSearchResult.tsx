import {Link} from '@remix-run/react';
import {SearchResultItem} from './ResultItem';
import {
  NormalizedPredictiveSearchResultItem,
  NormalizedPredictiveSearchResults,
  SearchResultTypeProps,
} from './types';
import clsx from "clsx";

export function PredictiveSearchResult({
  goToSearchResult,
  items,
  searchTerm,
  type,
}: SearchResultTypeProps) {
  const isSuggestions = type === 'queries';
  const categoryUrl = `/search?q=${
    searchTerm.current
  }&type=${pluralToSingularSearchType(type)}`;

  return (
    <div
      className="predictive-search-result flex flex-col gap-4 divide-y divide-bar-subtle"
      key={type}
    >
      <Link prefetch="intent" to={categoryUrl} onClick={goToSearchResult}>
        <h5 className="uppercase font-semibold">{isSuggestions ? 'Suggestions' : type}</h5>
      </Link>
      <ul className={clsx("pt-5", type === "products" ? 'space-y-4' : 'space-y-1')}>
        {items.map((item: NormalizedPredictiveSearchResultItem) => (
          <SearchResultItem
            goToSearchResult={goToSearchResult}
            item={item}
            key={item.id}
          />
        ))}
      </ul>
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
    | NormalizedPredictiveSearchResults[number]['type']
    | Array<NormalizedPredictiveSearchResults[number]['type']>,
) {
  const plural = {
    articles: 'ARTICLE',
    collections: 'COLLECTION',
    pages: 'PAGE',
    products: 'PRODUCT',
    queries: 'QUERY',
  };

  if (typeof type === 'string') {
    return plural[type];
  }

  return type.map((t) => plural[t]).join(',');
}
