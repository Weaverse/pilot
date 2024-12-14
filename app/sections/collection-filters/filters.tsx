import { CaretRight } from "@phosphor-icons/react";
import * as Accordion from "@radix-ui/react-accordion";
import { useLoaderData } from "@remix-run/react";
import type { Filter } from "@shopify/hydrogen/storefront-api-types";
import clsx from "clsx";
import type { CollectionDetailsQuery } from "storefrontapi.generated";
import { useClosestWeaverseItem } from "~/hooks/use-closest-weaverse-item";
import { cn } from "~/lib/cn";
import type { AppliedFilter } from "~/lib/filter";
import type { CollectionFiltersData } from ".";
import { FilterItem } from "./filter-item";
import { PriceRangeFilter } from "./price-range-filter";

const COLORS_FILTERS = ["Color", "Colors", "Colour", "Colours"];

export function Filters({ className }: { className?: string }) {
  let parentInstance = useClosestWeaverseItem(".filters-list");
  let parentData = parentInstance.data as unknown as CollectionFiltersData;
  let {
    expandFilters,
    showFiltersCount,
    enableColorSwatch,
    displayAsButtonFor,
  } = parentData;
  let { collection, appliedFilters } = useLoaderData<
    CollectionDetailsQuery & {
      collections: Array<{ handle: string; title: string }>;
      appliedFilters: AppliedFilter[];
    }
  >();
  let appliedFiltersKeys = appliedFilters
    .map((filter) => filter.label)
    .join("-");
  let filters = collection.products.filters as Filter[];

  return (
    <Accordion.Root
      type="multiple"
      className={cn("filters-list divide-y divide-line-subtle", className)}
      key={
        collection.id + appliedFiltersKeys + expandFilters + showFiltersCount
      }
      defaultValue={expandFilters ? filters.map((filter) => filter.id) : []}
    >
      {filters.map((filter: Filter) => {
        let asColorSwatch =
          enableColorSwatch && COLORS_FILTERS.includes(filter.label);
        let asButton = displayAsButtonFor.includes(filter.label);

        return (
          <Accordion.Item
            key={filter.id}
            value={filter.id}
            className="w-full pb-6 pt-7"
          >
            <Accordion.Trigger className="flex w-full justify-between items-center [&>svg]:data-[state=open]:rotate-90">
              <span>{filter.label}</span>
              <CaretRight className="w-4 h-4 transition-transform rotate-0" />
            </Accordion.Trigger>
            <Accordion.Content
              style={
                {
                  "--slide-up-from": "var(--radix-accordion-content-height)",
                  "--slide-down-to": "var(--radix-accordion-content-height)",
                  "--slide-up-duration": "0.15s",
                  "--slide-down-duration": "0.15s",
                } as React.CSSProperties
              }
              className={clsx([
                "overflow-hidden",
                "data-[state=closed]:animate-slide-up",
                "data-[state=open]:animate-slide-down",
              ])}
            >
              <div
                className={clsx(
                  "flex pt-8",
                  asColorSwatch || asButton
                    ? "gap-1.5 flex-wrap"
                    : "flex-col gap-5",
                )}
              >
                {filter.type === "PRICE_RANGE" ? (
                  <PriceRangeFilter
                    collection={
                      collection as CollectionDetailsQuery["collection"]
                    }
                  />
                ) : (
                  filter.values?.map((option) => (
                    <FilterItem
                      key={option.id}
                      displayAs={
                        asColorSwatch
                          ? "color-swatch"
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
  );
}
