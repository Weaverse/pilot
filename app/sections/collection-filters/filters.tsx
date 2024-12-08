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
import type { SyntheticEvent } from "react";
import { useState } from "react";
import type { CollectionDetailsQuery } from "storefrontapi.generated";
import { Checkbox } from "~/components/checkbox";
import { IconCaretRight } from "~/components/icons";
import { FILTER_URL_PREFIX } from "~/lib/const";
import type { AppliedFilter } from "~/lib/filter";
import { getAppliedFilterLink, getFilterLink } from "~/lib/filter";
import { Input } from "../../modules/input";
import { useClosestWeaverseItem } from "~/hooks/use-closest-weaverse-item";
import type { CollectionFiltersData } from ".";

export function Filters() {
  let parentInstance = useClosestWeaverseItem(".filters-list");
  let parentData = parentInstance.data as unknown as CollectionFiltersData;
  let { expandFilters, showFiltersCount } = parentData;
  let [params] = useSearchParams();
  let { collection, appliedFilters } = useLoaderData<
    CollectionDetailsQuery & {
      collections: Array<{ handle: string; title: string }>;
      appliedFilters: AppliedFilter[];
    }
  >();
  let filters = collection.products.filters as Filter[];

  let filterMarkup = (filter: Filter, option: Filter["values"][0]) => {
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
        return <PriceRangeFilter min={min} max={max} />;
      }

      default:
        return (
          <ListItemFilter
            appliedFilters={appliedFilters as AppliedFilter[]}
            option={option}
            showFiltersCount={showFiltersCount}
          />
        );
    }
  };

  return (
    <Accordion.Root
      type="multiple"
      className="filters-list"
      key={expandFilters.toString() + showFiltersCount}
      defaultValue={expandFilters ? filters.map((filter) => filter.id) : []}
    >
      {filters.map((filter: Filter) => (
        <Accordion.Item
          key={filter.id}
          value={filter.id}
          className="w-full pb-6 pt-7 border-b border-[#b7b7b7]"
        >
          <Accordion.Trigger className="flex w-full justify-between items-center [&>svg]:data-[state=open]:rotate-90">
            <span>{filter.label}</span>
            <IconCaretRight className="w-4 h-4 transition-transform rotate-0" />
          </Accordion.Trigger>
          <Accordion.Content>
            <ul key={filter.id} className="space-y-5 pt-8">
              {filter.values?.map((option) => {
                return <li key={option.id}>{filterMarkup(filter, option)}</li>;
              })}
            </ul>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

function ListItemFilter({
  option,
  appliedFilters,
  showFiltersCount,
}: {
  option: Filter["values"][0];
  appliedFilters: AppliedFilter[];
  showFiltersCount: boolean;
}) {
  let navigate = useNavigate();
  let [params] = useSearchParams();
  let location = useLocation();
  let filter = appliedFilters.find(
    (filter) => JSON.stringify(filter.filter) === option.input,
  );
  let [checked, setChecked] = useState(!!filter);

  let handleCheckedChange = (checked: boolean) => {
    setChecked(checked);
    if (checked) {
      const link = getFilterLink(option.input as string, params, location);
      navigate(link);
    } else if (filter) {
      let link = getAppliedFilterLink(filter, params, location);
      navigate(link);
    }
  };
  return (
    <div className="flex gap-2">
      <Checkbox
        checked={checked}
        onCheckedChange={handleCheckedChange}
        label={
          showFiltersCount ? `${option.label} (${option.count})` : option.label
        }
      />
    </div>
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
