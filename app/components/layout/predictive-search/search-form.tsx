import { useFetcher, useParams } from "@remix-run/react";
import { useEffect, useRef } from "react";
import type {
  NormalizedPredictiveSearchResults,
  SearchFromProps,
} from "~/types/predictive-search";

/**
 *  Search form component that posts search requests to the `/search` route
 **/
export function PredictiveSearchForm({
  action,
  children,
  className = "predictive-search-form",
  method = "POST",
  ...props
}: SearchFromProps) {
  let params = useParams();
  let fetcher = useFetcher<NormalizedPredictiveSearchResults>();
  let inputRef = useRef<HTMLInputElement | null>(null);

  function fetchResults(event: React.ChangeEvent<HTMLInputElement>) {
    let searchAction = action ?? "/api/predictive-search";
    let localizedAction = params.locale
      ? `/${params.locale}${searchAction}`
      : searchAction;
    let newSearchTerm = event.target.value || "";
    fetcher.submit(
      { q: newSearchTerm, limit: "6" },
      { method, action: localizedAction },
    );
  }

  // ensure the passed input has a type of search, because SearchResults
  // will select the element based on the input
  useEffect(() => {
    inputRef?.current?.setAttribute("type", "search");
    inputRef?.current?.focus();
  }, []);

  return (
    <fetcher.Form
      {...props}
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!inputRef?.current || inputRef.current.value === "") {
          return;
        }
        inputRef.current.blur();
      }}
    >
      {children({ fetchResults, inputRef, fetcher })}
    </fetcher.Form>
  );
}
