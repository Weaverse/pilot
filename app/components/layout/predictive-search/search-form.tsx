import { type ReactNode, type RefObject, useEffect, useRef } from "react";
import { type FormProps, useFetcher, useParams } from "react-router";
import type { NormalizedPredictiveSearchResults } from "~/types/predictive-search";

type ChildrenRenderProps = {
  fetchResults: (event: string) => void;
  fetcher: ReturnType<typeof useFetcher<NormalizedPredictiveSearchResults>>;
  inputRef: RefObject<HTMLInputElement | null>;
};

type SearchFromProps = {
  action?: FormProps["action"];
  method?: FormProps["method"];
  className?: string;
  children: (passedProps: ChildrenRenderProps) => ReactNode;
  [key: string]: unknown;
};

/**
 *  Search form component that posts search requests to the `/search` route
 */
export function PredictiveSearchForm({
  action,
  children,
  className = "predictive-search-form",
  method = "POST",
  ...props
}: SearchFromProps) {
  const params = useParams();
  const fetcher = useFetcher<NormalizedPredictiveSearchResults>();
  const inputRef = useRef<HTMLInputElement | null>(null);

  function fetchResults(searchTerm: string) {
    const searchAction = action ?? "/api/predictive-search";
    const localizedAction = params.locale
      ? `/${params.locale}${searchAction}`
      : searchAction;
    fetcher.submit(
      { q: searchTerm, limit: "6" },
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
