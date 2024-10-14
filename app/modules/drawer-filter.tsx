import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { CaretDown, Sliders } from "@phosphor-icons/react";
import {
  Link,
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
import Button from "~/components/button";
import { Checkbox } from "~/components/checkbox";
import { IconCaretDown, IconCaretRight } from "~/components/icons";
import { FILTER_URL_PREFIX } from "~/lib/const";
import type { AppliedFilter, SortParam } from "~/lib/filter";
import { getAppliedFilterLink, getFilterLink, getSortLink } from "~/lib/filter";
import { Drawer, useDrawer } from "./drawer";
import { IconFourGrid, IconOneGrid, IconThreeGrid, IconTwoGrid } from "./icon";
import { Input } from "./input";

type DrawerFilterProps = {
  productNumber?: number;
  filters: Filter[];
  appliedFilters?: AppliedFilter[];
  collections?: Array<{ handle: string; title: string }>;
  showSearchSort?: boolean;
  numberInRow?: number;
  onLayoutChange: (number: number) => void;
};

export function DrawerFilter({
  filters,
  numberInRow,
  onLayoutChange,
  appliedFilters = [],
  productNumber = 0,
  showSearchSort = false,
}: DrawerFilterProps) {
  const { openDrawer, isOpen, closeDrawer } = useDrawer();
  return (
    <div className="border-y border-line/30 py-4">
      <div className="gap-4 md:gap-8 flex w-full items-center justify-between">
        <div className="flex gap-1 flex-1">
          <button
            type="button"
            className={clsx(
              "border cursor-pointer hidden lg:block",
              numberInRow === 4 && " bg-gray-200"
            )}
            onClick={() => onLayoutChange(4)}
          >
            <IconFourGrid className="w-10 h-10" />
          </button>
          <button
            type="button"
            className={clsx(
              "border cursor-pointer hidden lg:block",
              numberInRow === 3 && " bg-gray-200"
            )}
            onClick={() => onLayoutChange(3)}
          >
            <IconThreeGrid className="w-10 h-10" />
          </button>
          <button
            type="button"
            className={clsx(
              "border cursor-pointer lg:hidden",
              numberInRow === 4 && "bg-gray-200"
            )}
            onClick={() => onLayoutChange(4)}
          >
            <IconTwoGrid className="w-10 h-10" />
          </button>
          <button
            type="button"
            className={clsx(
              "border cursor-pointer lg:hidden",
              numberInRow === 3 && "bg-gray-200"
            )}
            onClick={() => onLayoutChange(3)}
          >
            <IconOneGrid className="w-10 h-10" />
          </button>
        </div>
        <span className="flex-1 text-center">{productNumber} Products</span>
        <div className="flex gap-2 flex-1 justify-end">
          <SortMenu showSearchSort={showSearchSort} />
          <Button
            onClick={openDrawer}
            variant="outline"
            className="flex items-center gap-1.5 border py-2"
          >
            <Sliders size={18} />
            <span>Filter</span>
          </Button>
          <Drawer
            open={isOpen}
            onClose={closeDrawer}
            openFrom="left"
            heading="Filter"
          >
            <div className="px-5 w-[360px]">
              <FiltersDrawer
                filters={filters}
                appliedFilters={appliedFilters}
                onLayoutChange={console.log}
              />
            </div>
          </Drawer>
        </div>
      </div>
    </div>
  );
}

function ListItemFilter({
  option,
  appliedFilters,
}: {
  option: Filter["values"][0];
  appliedFilters: AppliedFilter[];
}) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const location = useLocation();
  let filter = appliedFilters.find(
    (filter) => JSON.stringify(filter.filter) === option.input
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
        label={option.label}
      />
    </div>
  );
}

export function FiltersDrawer({
  filters = [],
  appliedFilters = [],
}: Omit<DrawerFilterProps, "children">) {
  const [params] = useSearchParams();
  const filterMarkup = (filter: Filter, option: Filter["values"][0]) => {
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
          <ListItemFilter appliedFilters={appliedFilters} option={option} />
        );
    }
  };

  return (
    <div className="text-sm">
      {filters.map((filter: Filter) => (
        <Disclosure
          as="div"
          key={filter.id}
          className="w-full pb-6 pt-7 border-b"
        >
          {({ open }) => (
            <>
              <DisclosureButton className="flex w-full justify-between items-center">
                <span className="text-sm">{filter.label}</span>
                {open ? (
                  <IconCaretDown className="w-4 h-4" />
                ) : (
                  <IconCaretRight className="w-4 h-4" />
                )}
              </DisclosureButton>
              <DisclosurePanel key={filter.id}>
                <ul key={filter.id} className="space-y-5 pt-8">
                  {filter.values?.map((option) => {
                    return (
                      <li key={option.id}>{filterMarkup(filter, option)}</li>
                    );
                  })}
                </ul>
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      ))}
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

export default function SortMenu({
  showSearchSort = false,
}: {
  showSearchSort?: boolean;
}) {
  const productShortItems: { label: string; key: SortParam }[] = [
    { label: "Featured", key: "featured" },
    {
      label: "Price: Low - High",
      key: "price-low-high",
    },
    {
      label: "Price: High - Low",
      key: "price-high-low",
    },
    {
      label: "Best Selling",
      key: "best-selling",
    },
    {
      label: "Newest",
      key: "newest",
    },
  ];

  const searchSortItems: { label: string; key: SortParam }[] = [
    {
      label: "Price: Low - High",
      key: "price-low-high",
    },
    {
      label: "Price: High - Low",
      key: "price-high-low",
    },
    {
      label: "Relevance",
      key: "relevance",
    },
  ];
  const items = showSearchSort ? searchSortItems : productShortItems;
  const [params] = useSearchParams();
  const location = useLocation();
  const activeItem =
    items.find((item) => item.key === params.get("sort")) || items[0];

  return (
    <Menu as="div" className="relative z-10">
      <MenuButton className="flex items-center gap-1.5 h-10 border px-4 py-2.5">
        <span className="font-medium">Sort by</span>
        <CaretDown />
      </MenuButton>
      <MenuItems
        as="nav"
        className="absolute right-0 top-12 flex h-fit w-40 flex-col gap-2 border border-line/75 bg-background p-5"
      >
        {items.map((item) => (
          <MenuItem key={item.label}>
            {() => (
              <Link to={getSortLink(item.key, params, location)}>
                <p
                  className={clsx(
                    "block text-base hover:underline underline-offset-4",
                    activeItem?.key === item.key ? "font-bold" : "font-normal"
                  )}
                >
                  {item.label}
                </p>
              </Link>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}
