import { SlidersIcon, XIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  createSchema,
  type HydrogenComponentProps,
  useThemeText,
} from "@weaverse/hydrogen";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useLoaderData } from "react-router";
import type { CollectionQuery } from "storefront-api.generated";
import { BreadCrumb } from "~/components/breadcrumb";
import { Button } from "~/components/button";
import { SortDropdown } from "~/components/product-grid/sort-dropdown";
import { useProductGridStore } from "~/components/product-grid/store";
import { ScrollArea } from "~/components/scroll-area";
import type { SortParam } from "~/types/others";
import { cn } from "~/utils/cn";
import { Filters, type FiltersProps } from "../filters/filters";

function FiltersDrawer({ filterSettings }: { filterSettings?: FiltersProps }) {
  const { t } = useThemeText();
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button
          variant="outline"
          className="flex h-12 items-center gap-1.5 border py-2"
          animate={false}
        >
          <SlidersIcon size={18} />
          <span>{t("collection.filter")}</span>
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
                <span>{t("collection.filters")}</span>
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="translate-x-2 p-2"
                  aria-label={t("collection.closeFilters")}
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
  productsCountFormat: string;
  enableFilter: boolean;
}

interface CollectionToolbarProps
  extends HydrogenComponentProps,
    CollectionToolbarData {}

function CollectionToolbar(props: CollectionToolbarProps) {
  const {
    enableSort,
    showBreadcrumb,
    showProductsCount,
    productsCountFormat,
    enableFilter = true,
    ...rest
  } = props;
  const { collection } = useLoaderData<CollectionQuery>();
  const { t } = useThemeText();
  let displayedCount = useProductGridStore((s) => s.displayedCount);
  let [totalCount, setTotalCount] = useState<number | string | null>(null);

  useEffect(() => {
    fetch(`/api/collection/${collection.handle}/product-count`)
      .then((res) => res.json())
      .then((data: { count: number | string }) => setTotalCount(data.count))
      .catch(() => setTotalCount(null));
  }, [collection.handle]);

  const sortOptions: Array<{ label: string; key: SortParam }> = [
    { label: t("collection.sortOptions.featured"), key: "featured" },
    { label: t("collection.sortOptions.relevance"), key: "relevance" },
    { label: t("collection.sortOptions.priceLowHigh"), key: "price-low-high" },
    { label: t("collection.sortOptions.priceHighLow"), key: "price-high-low" },
    { label: t("collection.sortOptions.bestSelling"), key: "best-selling" },
    { label: t("collection.sortOptions.newest"), key: "newest" },
  ];

  let formattedCount = "";
  if (displayedCount > 0 && totalCount !== null) {
    formattedCount = productsCountFormat
      .replace("{{displayed_products}}", String(displayedCount))
      .replace("{{total}}", String(totalCount));
  } else if (displayedCount > 0) {
    formattedCount = t("collection.productsCount", { count: displayedCount });
  }

  return (
    <div {...rest} className="col-span-full border-gray-300 border-y py-4">
      <div className="flex w-full items-center">
        <div className="hidden items-center gap-2 md:flex">
          {showBreadcrumb && <BreadCrumb page={collection.title} />}
          {showProductsCount && formattedCount && (
            <>
              <span className="text-foreground/60">·</span>
              <span className="text-foreground/60">{formattedCount}</span>
            </>
          )}
        </div>
        {enableSort && (
          <SortDropdown
            options={sortOptions}
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
          type: "text",
          name: "productsCountFormat",
          label: "Products count format",
          defaultValue: "{{displayed_products}} of {{total}} products",
          helpText:
            "Use {{displayed_products}} for displayed count and {{total}} for total count.",
          condition: (data) => data.showProductsCount,
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
