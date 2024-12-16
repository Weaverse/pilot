import { MagnifyingGlass, X } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { cn } from "~/lib/cn";
import { PredictiveSearchResults } from "./predictive-search-results";
import { PredictiveSearchForm } from "./search-form";

export function PredictiveSearchButton() {
  return (
    <Dialog.Root>
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
