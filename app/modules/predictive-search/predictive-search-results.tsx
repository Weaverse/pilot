import Button from "~/components/button";
import { IconArrowRight } from "~/components/icons";
import { usePredictiveSearch } from "~/hooks/use-predictive-search";
import { PredictiveSearchResult } from "./predictive-search-result";

export function PredictiveSearchResults() {
  let { results, totalResults, searchTerm, searchInputRef } =
    usePredictiveSearch();
  let queries = results?.find(({ type }) => type === "queries");
  let articles = results?.find(({ type }) => type === "articles");
  let products = results?.find(({ type }) => type === "products");

  function goToSearchResult(event: React.MouseEvent<HTMLAnchorElement>) {
    let type = event.currentTarget.dataset.type;
    if (!searchInputRef.current) return;
    if (type === "SearchQuerySuggestion") {
      searchInputRef.current.value = event.currentTarget.innerText;
      // dispatch event onchange for the search
      searchInputRef.current.focus();
    } else {
      searchInputRef.current.blur();
      searchInputRef.current.value = "";
      // close the aside
      window.location.href = event.currentTarget.href;
    }
  }

  if (!totalResults) {
    return (
      <div className="absolute top-20 z-10 flex w-full items-center justify-center">
        <NoPredictiveSearchResults searchTerm={searchTerm} />
      </div>
    );
  }
  return (
    <div className="absolute left-1/2 top-full z-10 flex w-fit -translate-x-1/2 items-center justify-center">
      <div className="grid w-screen min-w-[430px] max-w-[720px] grid-cols-1 gap-6 bg-white p-6 lg:grid-cols-[1fr_2fr] max-h-[80vh] overflow-y-auto">
        <div className="space-y-8">
          <div className="flex flex-col gap-4 divide-y divide-line">
            <PredictiveSearchResult
              goToSearchResult={goToSearchResult}
              items={queries?.items}
              searchTerm={searchTerm}
              type="queries"
            />
          </div>
          <div className="flex flex-col gap-4">
            <PredictiveSearchResult
              goToSearchResult={goToSearchResult}
              items={articles?.items}
              searchTerm={searchTerm}
              type="articles"
            />
          </div>
        </div>
        <div className="space-y-6">
          <PredictiveSearchResult
            goToSearchResult={goToSearchResult}
            items={products?.items?.slice(0, 5)}
            searchTerm={searchTerm}
            type="products"
          />
          {searchTerm.current && (
            <div>
              <Button
                variant="link"
                onClick={goToSearchResult}
                link={`/search?q=${searchTerm.current}`}
                className="flex items-center gap-2 w-fit"
              >
                <span>View all products</span>
                <IconArrowRight className="w-4 h-4" />
              </Button>
              {/* <Link
                onClick={goToSearchResult}
                to={`/search?q=${searchTerm.current}`}
                className="flex items-center gap-2"
              >
                <span className="underline-animation">View all products</span>
                <IconArrowRight className="w-4 h-4 mb-[3px]" />
              </Link> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NoPredictiveSearchResults({
  searchTerm,
}: {
  searchTerm: React.MutableRefObject<string>;
}) {
  if (!searchTerm.current) {
    return null;
  }
  return (
    <p className="w-[640px] shadow-header bg-background p-6">
      No results found for <q>{searchTerm.current}</q>
    </p>
  );
}
