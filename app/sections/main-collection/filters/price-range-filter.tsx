import * as Slider from "@radix-ui/react-slider";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useCollection, useCollectionActions } from "@shopify/hydrogen/react";
import clsx from "clsx";
import { useRef, useState } from "react";
import type { CollectionQuery } from "~/routes/collections/collection-query";

export function PriceRangeFilter({
  collection,
}: {
  collection: CollectionQuery["collection"];
}) {
  const filters = useCollection((state) => state.filters);
  const { setFilters } = useCollectionActions();
  const thumbRef = useRef<"from" | "to" | null>(null);

  const { minVariantPrice, maxVariantPrice } = getPricesRange(collection);
  const { min, max } = filters.find((filter) => filter.price)?.price ?? {};

  const [minPrice, setMinPrice] = useState(min);
  const [maxPrice, setMaxPrice] = useState(max);
  // The store syncs from the URL after this mounts (chip removal, back/forward),
  // so reset the drafts whenever the committed range changes.
  const [committed, setCommitted] = useState({ min, max });
  if (committed.min !== min || committed.max !== max) {
    setCommitted({ min, max });
    setMinPrice(min);
    setMaxPrice(max);
  }

  function handleFilter() {
    if (minPrice === min && maxPrice === max) {
      return;
    }
    const otherFilters = filters.filter((filter) => !filter.price);
    if (minPrice === undefined && maxPrice === undefined) {
      setFilters(otherFilters);
    } else {
      setFilters([
        ...otherFilters,
        { price: { min: minPrice, max: maxPrice } },
      ]);
    }
  }

  return (
    <div className="space-y-4">
      <Slider.Root
        min={minVariantPrice}
        max={maxVariantPrice}
        step={1}
        minStepsBetweenThumbs={1}
        value={[minPrice || minVariantPrice, maxPrice || maxVariantPrice]}
        onValueChange={([newMin, newMax]) => {
          if (thumbRef.current) {
            if (thumbRef.current === "from") {
              if (maxPrice === undefined || newMin < maxPrice) {
                setMinPrice(newMin);
              }
            } else if (minPrice === undefined || newMax > minPrice) {
              setMaxPrice(newMax);
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
            onPointerUp={() => {
              thumbRef.current = null;
            }}
            onPointerDown={() => {
              thumbRef.current = s;
            }}
            className={clsx(
              "block h-4 w-4 cursor-grab rounded-full bg-gray-800 shadow-md",
              "focus-visible:outline-hidden",
            )}
          />
        ))}
      </Slider.Root>
      <div className="flex items-center gap-4">
        <div className="border-line-subtle flex shrink items-center gap-1 rounded-md border bg-gray-50 px-4">
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
            min={minVariantPrice}
            placeholder={minVariantPrice.toString()}
            onChange={(e) => {
              const { value } = e.target;
              const newMinPrice = Number.isNaN(Number.parseFloat(value))
                ? undefined
                : Number.parseFloat(value);
              setMinPrice(newMinPrice);
            }}
            onBlur={handleFilter}
            className="w-full border-none bg-transparent py-3 text-right focus:ring-0 focus:outline-hidden focus-visible:outline-hidden"
          />
        </div>
        <span>To</span>
        <div className="border-line-subtle flex items-center gap-1 rounded-md border bg-gray-50 px-4">
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
            max={maxVariantPrice}
            placeholder={maxVariantPrice.toString()}
            onChange={(e) => {
              const { value } = e.target;
              const newMaxPrice = Number.isNaN(Number.parseFloat(value))
                ? undefined
                : Number.parseFloat(value);
              setMaxPrice(newMaxPrice);
            }}
            onBlur={handleFilter}
            className="w-full border-none bg-transparent py-3 text-right focus:ring-0 focus:outline-hidden focus-visible:outline-hidden"
          />
        </div>
      </div>
    </div>
  );
}

function getPricesRange(collection: CollectionQuery["collection"]) {
  const { highestPriceProduct, lowestPriceProduct } = collection;
  const minVariantPrice =
    lowestPriceProduct.nodes[0]?.priceRange?.minVariantPrice;
  const maxVariantPrice =
    highestPriceProduct.nodes[0]?.priceRange?.maxVariantPrice;
  return {
    minVariantPrice: Number(minVariantPrice?.amount) || 0,
    maxVariantPrice: Number(maxVariantPrice?.amount) || 1000,
  };
}
