import { CaretRightIcon } from "@phosphor-icons/react";
import * as Accordion from "@radix-ui/react-accordion";
import type { Filter } from "@shopify/hydrogen/storefront-api-types";
import clsx from "clsx";
import { useRef } from "react";
import { useLoaderData } from "react-router";
import type { CollectionQuery } from "storefront-api.generated";
import { OPTIONS_AS_SWATCH } from "~/components/product/product-option-values";
import { ScrollArea } from "~/components/scroll-area";
import { useClosestWeaverseItem } from "~/hooks/use-closest-weaverse-item";
import { cn } from "~/utils/cn";
import type { AppliedFilter } from "~/utils/filter";
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
    <ScrollArea className="h-[calc(100vh-var(--height-nav)-100px)]">
      <Accordion.Root
        type="multiple"
        className={cn("divide-y divide-line-subtle pr-3", className)}
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
              className="w-full pt-7 pb-6"
            >
              <Accordion.Trigger className="flex w-full items-center justify-between data-[state=open]:[&>svg]:rotate-90">
                <span>{filter.label}</span>
                <CaretRightIcon className="h-4 w-4 rotate-0 transition-transform" />
              </Accordion.Trigger>
              <Accordion.Content
                style={
                  {
                    "--expand-to": "var(--radix-accordion-content-height)",
                    "--expand-duration": "0.15s",
                    "--collapse-from": "var(--radix-accordion-content-height)",
                    "--collapse-duration": "0.15s",
                  } as React.CSSProperties
                }
                className={clsx([
                  "overflow-hidden",
                  "data-[state=closed]:animate-collapse",
                  "data-[state=open]:animate-expand",
                ])}
              >
                <div
                  className={clsx(
                    "flex pt-8",
                    asSwatch || asButton
                      ? "flex-wrap gap-1.5"
                      : "flex-col gap-5",
                  )}
                >
                  {filter.type === "PRICE_RANGE" ? (
                    <PriceRangeFilter
                      collection={collection as CollectionQuery["collection"]}
                    />
                  ) : (
                    filter.values?.map((option) => (
                      <FilterItem
                        key={option.id}
                        displayAs={
                          asSwatch
                            ? "swatch"
                            : asButton
                              ? "button"
                              : "list-item"
                        }
                        appliedFilters={appliedFilters as AppliedFilter[]}
                        option={option}
                        showFiltersCount={showFiltersCount}
                      />
                    ))
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
