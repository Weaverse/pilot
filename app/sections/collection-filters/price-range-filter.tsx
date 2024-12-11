import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useLocation, useNavigate } from "@remix-run/react";
import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";
import type { SyntheticEvent } from "react";
import { useMemo, useState } from "react";
import useDebounce from "react-use/esm/useDebounce";
import { FILTER_URL_PREFIX } from "~/lib/const";
import { filterInputToParams } from "~/lib/filter";

const PRICE_RANGE_FILTER_DEBOUNCE = 500;

export function PriceRangeFilter({
  max,
  min,
  minVariantPrice,
  maxVariantPrice,
}: {
  max?: number;
  min?: number;

  minVariantPrice: MoneyV2;
  maxVariantPrice: MoneyV2;
}) {
  let location = useLocation();
  let params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  let navigate = useNavigate();

  let [minPrice, setMinPrice] = useState(min);
  let [maxPrice, setMaxPrice] = useState(max);

  useDebounce(
    () => {
      if (minPrice === undefined && maxPrice === undefined) {
        params.delete(`${FILTER_URL_PREFIX}price`);
        navigate(`${location.pathname}?${params.toString()}`);
        return;
      }

      let price = {
        ...(minPrice === undefined ? {} : { min: minPrice }),
        ...(maxPrice === undefined ? {} : { max: maxPrice }),
      };
      let newParams = filterInputToParams({ price }, params);
      navigate(`${location.pathname}?${newParams.toString()}`);
    },
    PRICE_RANGE_FILTER_DEBOUNCE,
    [minPrice, maxPrice],
  );

  function onChangeMax(event: SyntheticEvent) {
    let { value } = event.target as HTMLInputElement;
    let newMaxPrice = Number.isNaN(Number.parseFloat(value))
      ? undefined
      : Number.parseFloat(value);
    setMaxPrice(newMaxPrice);
  }

  function onChangeMin(event: SyntheticEvent) {
    let { value } = event.target as HTMLInputElement;
    let newMinPrice = Number.isNaN(Number.parseFloat(value))
      ? undefined
      : Number.parseFloat(value);
    setMinPrice(newMinPrice);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1 px-4 border border-line-subtle bg-gray-50 shrink">
        <VisuallyHidden.Root asChild>
          <label htmlFor="minPrice" aria-label="Min price">
            Min price
          </label>
        </VisuallyHidden.Root>
        <span>$</span>
        <input
          name="minPrice"
          type="number"
          value={minPrice ?? ""}
          min={Number(minVariantPrice.amount)}
          placeholder={Number(minVariantPrice.amount).toString()}
          onChange={onChangeMin}
          className="text-right focus-visible:outline-none py-3 bg-transparent w-full"
        />
      </div>
      <span>To</span>
      <div className="flex items-center gap-1 px-4 border border-line-subtle bg-gray-50">
        <VisuallyHidden.Root asChild>
          <label htmlFor="maxPrice" aria-label="Max price">
            Max price
          </label>
        </VisuallyHidden.Root>
        <span>$</span>
        <input
          name="maxPrice"
          type="number"
          value={maxPrice ?? ""}
          max={Number(maxVariantPrice.amount)}
          placeholder={Number(maxVariantPrice.amount).toString()}
          onChange={onChangeMax}
          className="text-right focus-visible:outline-none py-3 bg-transparent w-full"
        />
      </div>
    </div>
  );
}
