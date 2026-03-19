import { SlidersIcon, XIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import clsx from "clsx";
import { useLoaderData } from "react-router";
import type { CollectionQuery } from "storefront-api.generated";
import { BreadCrumb } from "~/components/breadcrumb";
import { Button } from "~/components/button";
import { SortDropdown } from "~/components/product-grid/sort-dropdown";
import { ScrollArea } from "~/components/scroll-area";
import type { SortParam } from "~/types/others";
import { cn } from "~/utils/cn";
import { Filters, type FiltersProps } from "../filters/filters";

const SORT_OPTIONS: Array<{ label: string; key: SortParam }> = [
  { label: "Featured", key: "featured" },
  { label: "Relevance", key: "relevance" },
  { label: "Price, (low to high)", key: "price-low-high" },
  { label: "Price, (high to low)", key: "price-high-low" },
  { label: "Best selling", key: "best-selling" },
  { label: "Newest", key: "newest" },
];

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
              <Filters className="px-4 pb-4" {...filterSettings} />
            </ScrollArea>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface CollectionToolbarData {
  enableSort: boolean;
  showBreadcrumb: boolean;
  showProductsCount: boolean;
  enableFilter: boolean;
}

interface CollectionToolbarProps
  extends HydrogenComponentProps,
    CollectionToolbarData {
  ref: React.Ref<HTMLDivElement>;
}

function CollectionToolbar(props: CollectionToolbarProps) {
  const {
    ref,
    enableSort,
    showBreadcrumb,
    showProductsCount,
    enableFilter = true,
    ...rest
  } = props;
  const { collection } = useLoaderData<CollectionQuery>();

  return (
    <div
      ref={ref}
      {...rest}
      className="col-span-full border-gray-300 border-y py-4"
    >
      <div className="flex w-full items-center">
        <div className="hidden items-center gap-2 md:flex">
          {showBreadcrumb && <BreadCrumb page={collection.title} />}
          {showProductsCount && (
            <span data-products-count className="text-foreground/60" />
          )}
        </div>
        {enableSort && (
          <SortDropdown
            options={SORT_OPTIONS}
            className={cn("md:ml-auto", enableFilter && "md:mr-4")}
          />
        )}
        <div className={cn("ml-auto md:ml-0", !enableFilter && "lg:hidden")}>
          <FiltersDrawer />
        </div>
      </div>
    </div>
  );
}

export default CollectionToolbar;

export const schema = createSchema({
  type: "mc--toolbar",
  title: "Toolbar",
  settings: [
    {
      group: "Toolbar",
      inputs: [
        {
          type: "switch",
          name: "showBreadcrumb",
          label: "Show breadcrumb",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "showProductsCount",
          label: "Show products count",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "enableSort",
          label: "Enable sorting",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "enableFilter",
          label: "Show filter drawer on desktop",
          defaultValue: false,
          helpText:
            "Filter drawer button always shows on mobile. Enable this to also show it on desktop.",
        },
      ],
    },
  ],
});
