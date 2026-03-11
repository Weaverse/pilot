import { CaretRightIcon } from "@phosphor-icons/react";
import * as Accordion from "@radix-ui/react-accordion";
import type { Filter } from "@shopify/hydrogen/storefront-api-types";
import clsx from "clsx";
import { useRef, useState } from "react";
import { useLoaderData } from "react-router";
import type { CollectionQuery } from "storefront-api.generated";
import { Button } from "~/components/button";
import { OPTIONS_AS_SWATCH } from "~/components/product/product-option-values";
import { ScrollArea } from "~/components/scroll-area";
import { useClosestWeaverseItem } from "~/hooks/use-closest-weaverse-item";
import type { AppliedFilter } from "~/types/others";
import { cn } from "~/utils/cn";
import type { CollectionFiltersData } from ".";
import { FilterItem } from "./filter-item";
import { PriceRangeFilter } from "./price-range-filter";

export function Filters({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const parentInstance = useClosestWeaverseItem(ref);
  const parentData = parentInstance.data as unknown as CollectionFiltersData;
  const {
    expandFilters,
    showFiltersCount,
    enableSwatches,
    displayAsButtonFor,
    filterItemsLimit,
  } = parentData;
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
              ref={ref}
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
