import { Input } from "~/modules";
import { IconMagnifyingGlass } from "~/components/Icons";
import { PredictiveSearchResults } from "./PredictiveSearchResults";
import { PredictiveSearchForm } from "./SearchForm";

export function PredictiveSearch(props: { isOpen?: boolean }) {
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
                <IconMagnifyingGlass className="h-5 w-5 shrink-0 text-gray-500" />
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
