import { CaretRightIcon } from "@phosphor-icons/react";
import * as Accordion from "@radix-ui/react-accordion";
import type { Filter } from "@shopify/hydrogen/storefront-api-types";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import clsx from "clsx";
import { useState } from "react";
import { useLoaderData } from "react-router";
import type { CollectionQuery } from "storefront-api.generated";
import { Button } from "~/components/button";
import { OPTIONS_AS_SWATCH } from "~/components/product/product-option-values";
import { ScrollArea } from "~/components/scroll-area";
import type { AppliedFilter } from "~/types/others";
import { cn } from "~/utils/cn";
import { useCollectionFiltersContext } from "./collection-filters-context";
import { FilterItem } from "./filter-item";
import { PriceRangeFilter } from "./price-range-filter";

export interface FiltersProps {
  className?: string;
  expandFilters?: boolean;
  showFiltersCount?: boolean;
  enableSwatches?: boolean;
  displayAsButtonFor?: string;
  filterItemsLimit?: number;
}

export function Filters({
  className,
  expandFilters = true,
  showFiltersCount = true,
  enableSwatches = true,
  displayAsButtonFor = "Size, More filters",
  filterItemsLimit = 10,
}: FiltersProps) {
  const { collection, appliedFilters } = useLoaderData<
    CollectionQuery & {
      collections: Array<{ handle: string; title: string }>;
      appliedFilters: AppliedFilter[];
    }
  >();
  const appliedFiltersKeys = appliedFilters
    .map((filter) => filter.label)
    .join("-");
  const filters = collection.products.filters as Filter[];

  return (
    <ScrollArea className="h-[calc(100vh-var(--height-nav)-100px)]" size="sm">
      <Accordion.Root
        type="multiple"
        className={cn("divide-y divide-gray-300 pr-3", className)}
        key={
          collection.id + appliedFiltersKeys + expandFilters + showFiltersCount
        }
        defaultValue={expandFilters ? filters.map((filter) => filter.id) : []}
      >
        {filters.map((filter: Filter) => {
          const asSwatch =
            enableSwatches && OPTIONS_AS_SWATCH.includes(filter.label);
          const asButton = displayAsButtonFor.includes(filter.label);

          return (
            <Accordion.Item
              key={filter.id}
              value={filter.id}
              className="w-full py-6"
            >
              <Accordion.Trigger className="flex w-full items-center justify-between data-[state=open]:[&>svg]:rotate-90">
                <span className="uppercase">{filter.label}</span>
                <CaretRightIcon className="h-4 w-4 rotate-0 transition-transform" />
              </Accordion.Trigger>
              <Accordion.Content
                className={clsx([
                  "overflow-hidden",
                  "[--expand-to:var(--radix-accordion-content-height)]",
                  "[--collapse-from:var(--radix-accordion-content-height)]",
                  "data-[state=closed]:animate-collapse",
                  "data-[state=open]:animate-expand",
                ])}
              >
                <div
                  className={clsx(
                    "flex pt-4",
                    asSwatch || asButton
                      ? "flex-wrap gap-1.5"
                      : "flex-col gap-2",
                  )}
                >
                  {filter.type === "PRICE_RANGE" ? (
                    <PriceRangeFilter
                      collection={collection as CollectionQuery["collection"]}
                    />
                  ) : (
                    <FilterValues
                      options={filter.values}
                      displayAs={
                        asSwatch ? "swatch" : asButton ? "button" : "list-item"
                      }
                      appliedFilters={appliedFilters as AppliedFilter[]}
                      showFiltersCount={showFiltersCount}
                      limit={filterItemsLimit || 10}
                    />
                  )}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          );
        })}
      </Accordion.Root>
    </ScrollArea>
  );
}

function FilterValues({
  options,
  displayAs,
  appliedFilters,
  showFiltersCount,
  limit,
}: {
  options: Filter["values"];
  displayAs: "swatch" | "button" | "list-item";
  appliedFilters: AppliedFilter[];
  showFiltersCount: boolean;
  limit: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = options.length > limit;

  // Always show applied/checked items even if beyond the limit
  const visibleOptions = expanded
    ? options
    : options.filter((option, index) => {
        if (index < limit) {
          return true;
        }
        // Keep applied filters visible even beyond limit
        return appliedFilters.some(
          (flt) => JSON.stringify(flt.filter) === option.input,
        );
      });

  return (
    <>
      {visibleOptions.map((option) => (
        <FilterItem
          key={option.id}
          displayAs={displayAs}
          appliedFilters={appliedFilters}
          option={option}
          showFiltersCount={showFiltersCount}
        />
      ))}
      {hasMore && (
        <div className="w-full">
          <Button
            variant="underline"
            animate={false}
            className="mt-2 text-sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded
              ? "Show less"
              : `Show more (+${options.length - visibleOptions.length})`}
          </Button>
        </div>
      )}
    </>
  );
}

// Weaverse child component wrapper
interface CollectionFiltersChildProps
  extends HydrogenComponentProps,
    Omit<FiltersProps, "className"> {
  ref: React.Ref<HTMLDivElement>;
}

function CollectionFiltersChild(props: CollectionFiltersChildProps) {
  const {
    ref,
    expandFilters,
    showFiltersCount,
    enableSwatches,
    displayAsButtonFor,
    filterItemsLimit,
    ...rest
  } = props;
  const { filtersPosition, enableFilter } = useCollectionFiltersContext();

  // This child only renders as sidebar; drawer mode is handled by the toolbar
  if (!enableFilter || filtersPosition !== "sidebar") {
    return null;
  }

  return (
    <div
      ref={ref}
      {...rest}
      className="hidden w-72 pt-6 lg:float-left lg:block lg:pb-20"
    >
      <div className="sticky top-[calc(var(--height-nav)+40px)] space-y-4 pr-5">
        <div className="font-bold">Filters</div>
        <Filters
          expandFilters={expandFilters}
          showFiltersCount={showFiltersCount}
          enableSwatches={enableSwatches}
          displayAsButtonFor={displayAsButtonFor}
          filterItemsLimit={filterItemsLimit}
        />
      </div>
    </div>
  );
}

export default CollectionFiltersChild;

export const schema = createSchema({
  type: "cf--filters",
  title: "Collection filters",
  settings: [
    {
      group: "Filters",
      inputs: [
        {
          type: "switch",
          name: "expandFilters",
          label: "Expand filters",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "showFiltersCount",
          label: "Show filters count",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "enableSwatches",
          label: "Enable color/image swatches",
          defaultValue: true,
        },
        {
          type: "text",
          name: "displayAsButtonFor",
          label: "Display as button for:",
          defaultValue: "Size, More filters",
          helpText: "Comma-separated list of filters to display as buttons",
        },
        {
          type: "range",
          name: "filterItemsLimit",
          label: "Max visible filter items",
          defaultValue: 10,
          configs: {
            min: 3,
            max: 30,
            step: 1,
          },
          helpText:
            'Items beyond this limit are hidden behind a "Show more" toggle',
        },
      ],
    },
  ],
});
