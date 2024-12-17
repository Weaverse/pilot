import { useFetchers } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
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
  let [results, setResults] = useState<NormalizedPredictiveSearchResults>();
  let fetchers = useFetchers();
  let searchTerm = useRef<string>("");
  let searchFetcher = fetchers.find((fetcher) => fetcher.data?.searchResults);

  useEffect(() => {
    if (searchFetcher) {
      setResults(searchFetcher.data?.searchResults);
    }
  }, [searchFetcher]);

  if (searchFetcher?.state === "loading") {
    searchTerm.current = (searchFetcher.formData?.get("q") || "") as string;
  }

  let search = (results || {
    results: NO_PREDICTIVE_SEARCH_RESULTS,
    totalResults: 0,
  }) as NormalizedPredictiveSearch;

  return { ...search, searchTerm };
}
