import { Sliders, X } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import { useLoaderData } from "@remix-run/react";
import { type VariantProps, cva } from "class-variance-authority";
import clsx from "clsx";
import type { CollectionDetailsQuery } from "storefrontapi.generated";
import { Button } from "~/components/button";
import { ScrollArea } from "~/components/scroll-area";
import { cn } from "~/lib/cn";
import { Filters } from "./filters";
import { LayoutSwitcher, type LayoutSwitcherProps } from "./layout-switcher";
import { Sort } from "./sort";

let variants = cva("", {
  variants: {
    width: {
      full: "",
      stretch: "-mx-3 px-3 md:-mx-10 md:px-10 lg:-mx-16 lg:px-16",
      fixed: [
        "-mx-3 px-3 md:-mx-10 md:px-10",
        "lg:-mx-[max(calc((100vw-var(--page-width))/2),1.5rem)]",
        "lg:px-[max(calc((100vw-var(--page-width))/2),1.5rem)]",
      ],
    },
  },
});

interface ToolsBarProps
  extends VariantProps<typeof variants>,
    LayoutSwitcherProps {
  enableSort: boolean;
  showProductsCount: boolean;
  enableFilter: boolean;
  filtersPosition: "sidebar" | "drawer";
  expandFilters: boolean;
  showFiltersCount: boolean;
}

export function ToolsBar({
  enableSort,
  enableFilter,
  filtersPosition,
  showProductsCount,
  width,
  gridSizeDesktop,
  gridSizeMobile,
  onGridSizeChange,
}: ToolsBarProps) {
  let { collection } = useLoaderData<CollectionDetailsQuery>();
  return (
    <div
      className={cn("border-y border-line-subtle py-4", variants({ width }))}
    >
      <div className="gap-4 md:gap-8 flex w-full items-center justify-between">
        <LayoutSwitcher
          gridSizeDesktop={gridSizeDesktop}
          gridSizeMobile={gridSizeMobile}
          onGridSizeChange={onGridSizeChange}
        />
        {showProductsCount && (
          <span className="text-center hidden md:inline">
            {collection?.products.nodes.length} Products
          </span>
        )}
        {(enableSort || (enableFilter && filtersPosition === "drawer")) && (
          <div className="flex gap-2">
            {enableSort && <Sort />}
            {enableFilter && (
              <FiltersDrawer filtersPosition={filtersPosition} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FiltersDrawer({
  filtersPosition,
}: { filtersPosition: ToolsBarProps["filtersPosition"] }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center gap-1.5 border py-2 h-12",
            filtersPosition === "sidebar" && "lg:hidden",
          )}
        >
          <Sliders size={18} />
          <span>Filter</span>
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 bg-black/50 data-[state=open]:animate-fade-in z-10"
          style={{ "--fade-in-duration": "100ms" } as React.CSSProperties}
        />
        <Dialog.Content
          className={clsx([
            "fixed inset-y-0 w-full md:w-[360px] bg-[--color-background] py-4 z-10",
            "left-0 -translate-x-full data-[state=open]:animate-enter-from-left",
          ])}
        >
          <div className="space-y-1">
            <div className="flex gap-2 items-center justify-between px-4">
              <span className="py-2.5 font-bold">Filters</span>
              <Dialog.Close asChild>
                <button
                  className="p-2 translate-x-2"
                  aria-label="Close filters drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>
            <ScrollArea className="max-h-[calc(100vh-4.5rem)]" size="sm">
              <Filters className="px-4" />
            </ScrollArea>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
