import { SlidersIcon, XIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";
import { useLoaderData } from "react-router";
import type { CollectionQuery } from "storefront-api.generated";
import { Button } from "~/components/button";
import { ScrollArea } from "~/components/scroll-area";
import { Filters, type FiltersProps } from "../filters/filters";
import { LayoutSwitcher, type LayoutSwitcherProps } from "./layout-switcher";
import { Sort } from "./sort";

function FiltersDrawer({ filterSettings }: { filterSettings?: FiltersProps }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button
          variant="outline"
          className="flex h-12 items-center gap-1.5 border py-2"
          animate={false}
        >
          <SlidersIcon size={18} />
          <span>Filter</span>
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className={clsx(
            "fixed inset-0 z-10 bg-black/50",
            "data-[state=open]:animate-[fade-in_150ms_ease-out]",
            "data-[state=closed]:animate-[fade-out_150ms_ease-in]",
          )}
        />
        <Dialog.Content
          onCloseAutoFocus={(e) => e.preventDefault()}
          className={clsx(
            "fixed inset-y-0 left-0 z-10 w-full bg-background py-4 md:w-90",
            "data-[state=open]:animate-[enter-from-left_200ms_ease-out]",
            "data-[state=closed]:animate-[exit-to-left_200ms_ease-in]",
          )}
          aria-describedby={undefined}
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2 px-4">
              <Dialog.Title asChild className="py-2.5 font-bold">
                <span>Filters</span>
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="translate-x-2 p-2"
                  aria-label="Close filters drawer"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
            <ScrollArea className="max-h-[calc(100vh-4.5rem)]" size="sm">
              <Filters className="px-4" {...filterSettings} />
            </ScrollArea>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface ToolbarProps extends LayoutSwitcherProps {
  enableSort: boolean;
  showProductsCount: boolean;
  enableFilter: boolean;
  drawerFilterSettings?: FiltersProps;
}

export function Toolbar({
  enableSort,
  enableFilter,
  showProductsCount,
  gridSizeDesktop,
  gridSizeMobile,
  onGridSizeChange,
  drawerFilterSettings,
}: ToolbarProps) {
  const { collection } = useLoaderData<CollectionQuery>();
  return (
    <div className="border-line-subtle border-y py-4">
      <div className="flex w-full items-center justify-between gap-4 md:gap-8">
        <LayoutSwitcher
          gridSizeDesktop={gridSizeDesktop}
          gridSizeMobile={gridSizeMobile}
          onGridSizeChange={onGridSizeChange}
        />
        {showProductsCount && (
          <span className="hidden text-center md:inline">
            {collection?.products.nodes.length} products
          </span>
        )}
        {(enableSort || enableFilter) && (
          <div className="flex gap-2">
            {enableSort && <Sort />}
            {enableFilter && (
              <FiltersDrawer filterSettings={drawerFilterSettings} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
