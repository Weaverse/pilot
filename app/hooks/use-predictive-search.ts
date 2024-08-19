import { useFetchers } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import type {
  NormalizedPredictiveSearch,
  NormalizedPredictiveSearchResults,
  UseSearchReturn,
} from "~/types/predictive-search";

export const NO_PREDICTIVE_SEARCH_RESULTS: NormalizedPredictiveSearchResults = [
  { type: "queries", items: [] },
  { type: "products", items: [] },
  { type: "collections", items: [] },
  { type: "pages", items: [] },
  { type: "articles", items: [] },
];

export function usePredictiveSearch(): UseSearchReturn {
  const fetchers = useFetchers();
  const searchTerm = useRef<string>("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchFetcher = fetchers.find((fetcher) => fetcher.data?.searchResults);
  let [results, setResults] = useState<NormalizedPredictiveSearchResults>();
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

  // capture the search input element as a ref
  useEffect(() => {
    if (searchInputRef.current) return;
    searchInputRef.current = document.querySelector('input[type="search"]');
  }, []);

  return { ...search, searchInputRef, searchTerm };
}
