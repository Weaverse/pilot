import { useEffect, useRef, useState } from "react";
import { useFetchers } from "react-router";
import type {
  NormalizedPredictiveSearch,
  NormalizedPredictiveSearchResults,
} from "~/types/predictive-search";

export const NO_PREDICTIVE_SEARCH_RESULTS: NormalizedPredictiveSearchResults = [
  { type: "queries", items: [] },
  { type: "products", items: [] },
  { type: "collections", items: [] },
  { type: "pages", items: [] },
  { type: "articles", items: [] },
];

export function usePredictiveSearch(): NormalizedPredictiveSearch & {
  searchTerm: React.MutableRefObject<string>;
} {
  const [results, setResults] = useState<NormalizedPredictiveSearchResults>();
  const fetchers = useFetchers();
  const searchTerm = useRef<string>("");
  const searchFetcher = fetchers.find((fetcher) => fetcher.data?.searchResults);

  useEffect(() => {
    if (searchFetcher) {
      setResults(searchFetcher.data?.searchResults);
    }
  }, [searchFetcher]);

  if (searchFetcher?.state === "loading") {
    searchTerm.current = (searchFetcher.formData?.get("q") || "") as string;
  }

  const search = (results || {
    results: NO_PREDICTIVE_SEARCH_RESULTS,
    totalResults: 0,
  }) as NormalizedPredictiveSearch;

  return { ...search, searchTerm };
}
