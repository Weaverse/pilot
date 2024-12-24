import { ArrowRight, MagnifyingGlass, X } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useLocation } from "@remix-run/react";
import { type MutableRefObject, useEffect, useState } from "react";
import Link from "~/components/link";
import { usePredictiveSearch } from "~/hooks/use-predictive-search";
import { cn } from "~/utils/cn";
import { PredictiveSearchResult } from "./predictive-search-result";
import { PredictiveSearchForm } from "./search-form";

export function PredictiveSearchButton() {
  let [open, setOpen] = useState(false);
  let location = useLocation();

  // biome-ignore lint/correctness/useExhaustiveDependencies: close the dialog when the location changes, aka when the user navigates to a search result page
  useEffect(() => {
    setOpen(false);
  }, [location]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        asChild
        className="hidden lg:flex h-8 w-8 items-center justify-center focus-visible:outline-none"
      >
        <button type="button">
          <MagnifyingGlass className="w-5 h-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 bg-black/50 data-[state=open]:animate-fade-in z-10"
          style={{ "--fade-in-duration": "100ms" } as React.CSSProperties}
        />
        <Dialog.Content
          className={cn([
            "fixed inset-x-0 top-0 bg-[--color-header-bg] z-10",
            "-translate-y-full data-[state=open]:animate-enter-from-top",
            "focus-visible:outline-none",
          ])}
          style={
            { "--enter-from-top-duration": "200ms" } as React.CSSProperties
          }
          aria-describedby={undefined}
        >
          <VisuallyHidden.Root asChild>
            <Dialog.Title>Predictive search</Dialog.Title>
          </VisuallyHidden.Root>
          <div className="relative pt-[--topbar-height]">
            <PredictiveSearchForm>
              {({ fetchResults, inputRef }) => (
                <div className="flex items-center gap-3 w-[560px] max-w-[90vw] mx-auto px-3 my-6 border border-line-subtle">
                  <MagnifyingGlass className="h-5 w-5 shrink-0 text-gray-500" />
                  <input
                    name="q"
                    type="search"
                    onChange={(e) => fetchResults(e.target.value)}
                    onFocus={(e) => fetchResults(e.target.value)}
                    placeholder="Enter a keyword"
                    ref={inputRef}
                    autoComplete="off"
                    className="focus-visible:outline-none w-full h-full py-4"
                  />
                  <button
                    type="button"
                    className="shrink-0 text-gray-500 p-1"
                    onClick={() => {
                      if (inputRef.current) {
                        inputRef.current.value = "";
                        fetchResults("");
                      }
                    }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </PredictiveSearchForm>
            <PredictiveSearchResults />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PredictiveSearchResults() {
  let { results, totalResults, searchTerm } = usePredictiveSearch();
  let queries = results?.find(({ type }) => type === "queries");
  let articles = results?.find(({ type }) => type === "articles");
  let products = results?.find(({ type }) => type === "products");

  if (!totalResults) {
    return (
      <div className="absolute top-full z-10 flex w-full items-center justify-center">
        <NoResults searchTerm={searchTerm} />
      </div>
    );
  }
  return (
    <div className="absolute left-1/2 top-full z-10 flex w-fit -translate-x-1/2 items-center justify-center">
      <div className="grid w-screen min-w-[430px] max-w-[720px] grid-cols-1 gap-6 bg-[--color-header-bg] p-6 lg:grid-cols-[1fr_2fr] max-h-[80vh] overflow-y-auto">
        <div className="space-y-8">
          <div className="flex flex-col gap-4 divide-y divide-line">
            <PredictiveSearchResult type="queries" items={queries?.items} />
          </div>
          <div className="flex flex-col gap-4">
            <PredictiveSearchResult type="articles" items={articles?.items} />
          </div>
        </div>
        <div className="space-y-6">
          <PredictiveSearchResult
            type="products"
            items={products?.items?.slice(0, 5)}
          />
          {searchTerm.current && (
            <div>
              <Link
                to={`/search?q=${searchTerm.current}`}
                variant="underline"
                className="flex items-center gap-2 w-fit"
              >
                <span>View all results</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NoResults({ searchTerm }: { searchTerm: MutableRefObject<string> }) {
  if (!searchTerm.current) {
    return null;
  }
  return (
    <p className="w-[640px] shadow-header bg-background p-6">
      No results found for <q>{searchTerm.current}</q>
    </p>
  );
}
