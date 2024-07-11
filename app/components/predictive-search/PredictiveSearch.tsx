import { IconSearch, Input } from "~/modules";
import { PredictiveSearchResults } from "./PredictiveSearchResults";
import { PredictiveSearchForm } from "./SearchForm";

interface PredictiveSearchProps {
  // Predictive search props
  isOpen?: boolean;
}

export function PredictiveSearch(props: PredictiveSearchProps) {
  let { isOpen } = props;
  return (
    <div className="relative border-t border-bar-subtle">
      <PredictiveSearchForm>
        {({ fetchResults, inputRef }) => (
          <div className="mx-auto w-full max-w-[560px] p-6">
            <Input
              name="q"
              type="search"
              onChange={fetchResults}
              onFocus={fetchResults}
              onClear={fetchResults}
              placeholder="Enter a keyword"
              ref={inputRef}
              className="rounded"
              autoComplete="off"
              prefixElement={
                <button type="submit" className="cursor-pointer">
                  <IconSearch
                    className="h-6 w-6 opacity-55"
                    viewBox="0 0 24 24"
                  />
                </button>
              }
              autoFocus={true}
            />
          </div>
        )}
      </PredictiveSearchForm>
      {isOpen && <PredictiveSearchResults />}
    </div>
  );
}
