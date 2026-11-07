import { usePredictiveSearchActions } from "@shopify/hydrogen/react";
import { type ReactNode, type RefObject, useEffect, useRef } from "react";

type ChildrenRenderProps = {
  fetchResults: (searchTerm: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
};

type SearchFromProps = {
  className?: string;
  children: (passedProps: ChildrenRenderProps) => ReactNode;
  [key: string]: unknown;
};

/**
 * Search form that runs predictive search as the shopper types, through the
 * nearest `PredictiveSearchProvider` (Hydrogen's store, `/api/predictive-search`).
 * The submit itself is handled by the input (Enter opens the search page).
 */
export function PredictiveSearchForm({
  children,
  className = "predictive-search-form",
  ...props
}: SearchFromProps) {
  const { search } = usePredictiveSearchActions();
  const inputRef = useRef<HTMLInputElement | null>(null);

  function fetchResults(searchTerm: string) {
    void search(searchTerm);
  }

  // ensure the passed input has a type of search, because SearchResults
  // will select the element based on the input
  useEffect(() => {
    inputRef?.current?.setAttribute("type", "search");
    inputRef?.current?.focus();
  }, []);

  return (
    <form
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
      {children({ fetchResults, inputRef })}
    </form>
  );
}
