import * as Accordion from "@radix-ui/react-accordion";
import {
  useLoaderData,
  useLocation,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import type {
  Filter,
  ProductFilter,
} from "@shopify/hydrogen/storefront-api-types";
import clsx from "clsx";
import type { SyntheticEvent } from "react";
import { useState } from "react";
import type { CollectionDetailsQuery } from "storefrontapi.generated";
import { Checkbox } from "~/components/checkbox";
import { IconCaretRight } from "~/components/icons";
import { useClosestWeaverseItem } from "~/hooks/use-closest-weaverse-item";
import { FILTER_URL_PREFIX } from "~/lib/const";
import type { AppliedFilter } from "~/lib/filter";
import { getAppliedFilterLink, getFilterLink } from "~/lib/filter";
import type { CollectionFiltersData } from ".";
import { Input } from "../../modules/input";
import { cn } from "~/lib/cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import { type SwatchesConfigs, useThemeSettings } from "@weaverse/hydrogen";
import { variants as productOptionsVariants } from "~/modules/product-form/options";

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
  let [params] = useSearchParams();
  let { collection, appliedFilters } = useLoaderData<
    CollectionDetailsQuery & {
      collections: Array<{ handle: string; title: string }>;
      appliedFilters: AppliedFilter[];
    }
  >();
  let filters = collection.products.filters as Filter[];

  return (
    <Accordion.Root
      type="multiple"
      className={cn("filters-list divide-y divide-line-subtle", className)}
      key={expandFilters.toString() + showFiltersCount}
      defaultValue={expandFilters ? filters.map((filter) => filter.id) : []}
    >
      {filters.map((filter: Filter) => {
        let asColorSwatch =
          enableColorSwatch && COLORS_FILTERS.includes(filter.label);

        return (
          <Accordion.Item
            key={filter.id}
            value={filter.id}
            className="w-full pb-6 pt-7"
          >
            <Accordion.Trigger className="flex w-full justify-between items-center [&>svg]:data-[state=open]:rotate-90">
              <span>{filter.label}</span>
              <IconCaretRight className="w-4 h-4 transition-transform rotate-0" />
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
                key={filter.id}
                className={clsx(
                  "flex pt-8",
                  asColorSwatch ? "gap-1.5 flex-wrap" : "flex-col gap-5",
                )}
              >
                {filter.values?.map((option) => {
                  switch (filter.type) {
                    case "PRICE_RANGE": {
                      let priceFilter = params.get(`${FILTER_URL_PREFIX}price`);
                      let price = priceFilter
                        ? (JSON.parse(priceFilter) as ProductFilter["price"])
                        : undefined;
                      let min = Number.isNaN(Number(price?.min))
                        ? undefined
                        : Number(price?.min);
                      let max = Number.isNaN(Number(price?.max))
                        ? undefined
                        : Number(price?.max);
                      return (
                        <PriceRangeFilter key={option.id} min={min} max={max} />
                      );
                    }
                    default:
                      return (
                        <ListItemFilter
                          key={option.id}
                          asColorSwatch={asColorSwatch}
                          appliedFilters={appliedFilters as AppliedFilter[]}
                          option={option}
                          showFiltersCount={showFiltersCount}
                        />
                      );
                  }
                })}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        );
      })}
    </Accordion.Root>
  );
}

function ListItemFilter({
  asColorSwatch,
  option,
  appliedFilters,
  showFiltersCount,
}: {
  asColorSwatch?: boolean;
  option: Filter["values"][0];
  appliedFilters: AppliedFilter[];
  showFiltersCount: boolean;
}) {
  let navigate = useNavigate();
  let [params] = useSearchParams();
  let location = useLocation();
  let themeSettings = useThemeSettings();
  let { options, swatches }: SwatchesConfigs = themeSettings.productSwatches;

  let filter = appliedFilters.find(
    (filter) => JSON.stringify(filter.filter) === option.input,
  );

  let [checked, setChecked] = useState(!!filter);

  function handleCheckedChange(checked: boolean) {
    setChecked(checked);
    if (checked) {
      let link = getFilterLink(option.input as string, params, location);
      navigate(link, { preventScrollReset: true });
    } else if (filter) {
      let link = getAppliedFilterLink(filter, params, location);
      navigate(link, { preventScrollReset: true });
    }
  }

  if (asColorSwatch) {
    let swatchColor = swatches.colors.find(({ name }) => name === option.label);
    let optionConf = options.find(({ name }) => {
      return name.toLowerCase() === option.label.toLowerCase();
    });

    let { shape = "square", size = "md" } = optionConf || {};
    return (
      <Tooltip>
        <TooltipTrigger>
          <button
            type="button"
            className={cn(
              productOptionsVariants({
                colorSize: size,
                shape,
              }),
              checked ? "p-1 border-line" : "border-line-subtle",
            )}
            onClick={() => handleCheckedChange(!checked)}
          >
            <span
              className={cn(
                "w-full h-full inline-block border-none hover:border-none",
                productOptionsVariants({ shape }),
              )}
              style={{
                backgroundColor:
                  swatchColor?.value || option.label.toLowerCase(),
              }}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {showFiltersCount ? (
            <span>
              {option.label}{" "}
              <span className="text-gray-100">({option.count})</span>
            </span>
          ) : (
            option.label
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Checkbox
      checked={checked}
      onCheckedChange={handleCheckedChange}
      label={
        showFiltersCount ? (
          <span>
            {option.label}{" "}
            <span className="text-gray-700">({option.count})</span>
          </span>
        ) : (
          option.label
        )
      }
    />
  );
}

// const PRICE_RANGE_FILTER_DEBOUNCE = 500;

function PriceRangeFilter({ max, min }: { max?: number; min?: number }) {
  // const location = useLocation();
  // const params = useMemo(
  //   () => new URLSearchParams(location.search),
  //   [location.search],
  // );
  // const navigate = useNavigate();

  const [minPrice, setMinPrice] = useState(min);
  const [maxPrice, setMaxPrice] = useState(max);

  // useDebounce(
  //   () => {
  //     if (minPrice === undefined && maxPrice === undefined) {
  //       params.delete(`${FILTER_URL_PREFIX}price`);
  //       navigate(`${location.pathname}?${params.toString()}`);
  //       return;
  //     }

  //     const price = {
  //       ...(minPrice === undefined ? {} : {min: minPrice}),
  //       ...(maxPrice === undefined ? {} : {max: maxPrice}),
  //     };
  //     const newParams = filterInputToParams({price}, params);
  //     navigate(`${location.pathname}?${newParams.toString()}`);
  //   },
  //   PRICE_RANGE_FILTER_DEBOUNCE,
  //   [minPrice, maxPrice],
  // );

  const onChangeMax = (event: SyntheticEvent) => {
    const value = (event.target as HTMLInputElement).value;
    const newMaxPrice = Number.isNaN(Number.parseFloat(value))
      ? undefined
      : Number.parseFloat(value);
    setMaxPrice(newMaxPrice);
  };

  const onChangeMin = (event: SyntheticEvent) => {
    const value = (event.target as HTMLInputElement).value;
    const newMinPrice = Number.isNaN(Number.parseFloat(value))
      ? undefined
      : Number.parseFloat(value);
    setMinPrice(newMinPrice);
  };

  return (
    <div className="flex gap-6">
      <label className="flex items-center gap-1" htmlFor="minPrice">
        <span>$</span>
        <Input
          name="minPrice"
          type="number"
          value={minPrice ?? ""}
          placeholder="From"
          onChange={onChangeMin}
        />
      </label>
      <label className="flex items-center gap-1" htmlFor="maxPrice">
        <span>$</span>
        <Input
          name="maxPrice"
          type="number"
          value={maxPrice ?? ""}
          placeholder="To"
          onChange={onChangeMax}
        />
      </label>
    </div>
  );
}
