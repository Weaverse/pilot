import * as Slider from "@radix-ui/react-slider";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useLocation, useNavigate, useSearchParams } from "@remix-run/react";
import type { ProductFilter } from "@shopify/hydrogen/storefront-api-types";
import clsx from "clsx";
import { useRef, useState } from "react";
import type { CollectionDetailsQuery } from "storefrontapi.generated";
import { FILTER_URL_PREFIX } from "~/lib/const";
import { filterInputToParams } from "~/lib/filter";

export function PriceRangeFilter({
  collection,
}: {
  collection: CollectionDetailsQuery["collection"];
}) {
  let [params] = useSearchParams();
  let location = useLocation();
  let navigate = useNavigate();
  let thumbRef = useRef<"from" | "to" | null>(null);

  let { highestPriceProduct, lowestPriceProduct } = collection;
  let minVariantPrice =
    lowestPriceProduct.nodes[0]?.priceRange?.minVariantPrice;
  let maxVariantPrice =
    highestPriceProduct.nodes[0]?.priceRange?.maxVariantPrice;

  let priceFilter = params.get(`${FILTER_URL_PREFIX}price`);
  let price = priceFilter
    ? (JSON.parse(priceFilter) as ProductFilter["price"])
    : undefined;
  let min = Number.isNaN(Number(price?.min))
    ? Number(minVariantPrice?.amount)
    : Number(price?.min);
  let max = Number.isNaN(Number(price?.max))
    ? Number(maxVariantPrice?.amount)
    : Number(price?.max);

  let [minPrice, setMinPrice] = useState(min);
  let [maxPrice, setMaxPrice] = useState(max);

  function handleFilter() {
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
  }

  return (
    <div className="space-y-4">
      <Slider.Root
        min={Number(minVariantPrice.amount)}
        max={Number(maxVariantPrice.amount)}
        step={1}
        minStepsBetweenThumbs={1}
        value={[minPrice, maxPrice]}
        onValueChange={([newMin, newMax]) => {
          if (thumbRef.current) {
            if (thumbRef.current === "from") {
              if (newMin < maxPrice) {
                setMinPrice(newMin);
              }
            } else {
              if (newMax > minPrice) {
                setMaxPrice(newMax);
              }
            }
          } else {
            setMinPrice(newMin);
            setMaxPrice(newMax);
          }
        }}
        onValueCommit={handleFilter}
        className="relative flex h-4 w-full items-center"
      >
        <Slider.Track className="relative h-1 grow rounded-full bg-gray-200">
          <Slider.Range className="absolute h-full rounded-full bg-gray-800" />
        </Slider.Track>
        {["from", "to"].map((s: "from" | "to") => (
          <Slider.Thumb
            key={s}
            onPointerUp={() => (thumbRef.current = null)}
            onPointerDown={() => (thumbRef.current = s)}
            className={clsx(
              "block h-4 w-4 bg-gray-800 cursor-grab rounded-full shadow-md",
              "focus-visible:outline-none",
            )}
          />
        ))}
      </Slider.Root>
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
            min={minVariantPrice.amount}
            placeholder={Number(minVariantPrice.amount).toString()}
            onChange={(e) => {
              let { value } = e.target;
              let newMinPrice = Number.isNaN(Number.parseFloat(value))
                ? undefined
                : Number.parseFloat(value);
              setMinPrice(newMinPrice);
            }}
            onBlur={handleFilter}
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
            max={maxVariantPrice.amount}
            placeholder={Number(maxVariantPrice.amount).toString()}
            onChange={(e) => {
              let { value } = e.target;
              let newMaxPrice = Number.isNaN(Number.parseFloat(value))
                ? undefined
                : Number.parseFloat(value);
              setMaxPrice(newMaxPrice);
            }}
            onBlur={handleFilter}
            className="text-right focus-visible:outline-none py-3 bg-transparent w-full"
          />
        </div>
      </div>
    </div>
  );
}
