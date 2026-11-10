import * as Checkbox from "@radix-ui/react-checkbox";
import { isFilterInputActive, type ProductFilter } from "@shopify/hydrogen";
import { useCollection, useCollectionActions } from "@shopify/hydrogen/react";
import type { Filter } from "@shopify/hydrogen/storefront-api-types";
import { Suspense, use } from "react";
import { useRouteLoaderData } from "react-router";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import type { RootLoader } from "~/root";
import { cn } from "~/utils/cn";

type FilterDisplayAs = "swatch" | "button" | "list-item";

export function FilterItem({
  displayAs,
  option,
  showFiltersCount,
}: {
  displayAs: FilterDisplayAs;
  option: Filter["values"][0];
  showFiltersCount: boolean;
}) {
  let rootData = useRouteLoaderData<RootLoader>("root");
  // The store updates the filters right away, so the control is checked
  // before the new products load, and back/forward navigation re-syncs it.
  const filters = useCollection((state) => state.filters);
  const { setFilters, toggleFilterInput } = useCollectionActions();
  const input = option.input as string;
  const checked = isFilterInputActive(filters, input);

  function handleCheckedChange(newChecked: boolean) {
    if (newChecked === checked) {
      return;
    }
    const filter = JSON.parse(input) as ProductFilter;
    if (newChecked && filter.available != null) {
      // In stock / out of stock is one choice: the store drops both when a
      // second availability filter is toggled on.
      setFilters([...filters.filter((f) => f.available == null), filter]);
    } else {
      toggleFilterInput(input);
    }
  }

  if (displayAs === "swatch") {
    return (
      <Suspense
        fallback={
          <span className="border-line-subtle bg-background h-10 w-10 animate-pulse border" />
        }
      >
        <SwatchFilterItem
          option={option}
          checked={checked}
          showFiltersCount={showFiltersCount}
          onCheckedChange={handleCheckedChange}
          swatchesConfigsPromise={rootData.swatchesConfigs}
        />
      </Suspense>
    );
  }

  if (displayAs === "button") {
    return (
      <button
        type="button"
        className={cn(
          "rounded-md border px-3 py-1.5 text-center disabled:cursor-not-allowed",
          option.count === 0 && "diagonal text-body-subtle",
          checked
            ? "border-line bg-body text-background"
            : "border-line-subtle hover:border-line",
        )}
        onClick={() => handleCheckedChange(!checked)}
        disabled={option.count === 0}
      >
        <FilterLabel option={option} showFiltersCount={showFiltersCount} />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2.5",
        option.count === 0 && "text-body-subtle",
      )}
    >
      <Checkbox.Root
        checked={checked}
        onCheckedChange={handleCheckedChange}
        disabled={option.count === 0}
        className={cn(
          "h-5 w-5 shrink-0 rounded-sm",
          "border-line border focus-visible:outline-hidden",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <Checkbox.Indicator className="flex items-center justify-center text-current">
          <span className="bg-body inline-block h-3 w-3 rounded-sm" />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <FilterLabel option={option} showFiltersCount={showFiltersCount} />
    </div>
  );
}
function SwatchFilterItem({
  option,
  checked,
  showFiltersCount,
  onCheckedChange,
  swatchesConfigsPromise,
}: {
  option: Filter["values"][0];
  checked: boolean;
  showFiltersCount: boolean;
  onCheckedChange: (checked: boolean) => void;
  swatchesConfigsPromise: Promise<{ colors: any[]; images: any[] }>;
}) {
  let { colors, images } = use(swatchesConfigsPromise);
  let swatchImage = images.find(({ name }) => name === option.label);
  let swatchColor = colors.find(({ name }) => name === option.label);

  return (
    <Tooltip>
      <TooltipTrigger>
        <button
          type="button"
          className={cn(
            "h-10 w-10 overflow-hidden rounded-md disabled:cursor-not-allowed",
            "hover:border-body border",
            checked ? "border-line p-1" : "border-line-subtle",
            option.count === 0 && "diagonal",
          )}
          onClick={() => onCheckedChange(!checked)}
          disabled={option.count === 0}
        >
          <span
            className="inline-block h-full w-full rounded-sm"
            style={{
              backgroundImage: swatchImage?.value
                ? `url(${swatchImage?.value})`
                : undefined,
              backgroundSize: "cover",
              backgroundColor: swatchColor?.value || option.label.toLowerCase(),
            }}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <FilterLabel option={option} showFiltersCount={showFiltersCount} />
      </TooltipContent>
    </Tooltip>
  );
}
function FilterLabel({
  option,
  showFiltersCount,
}: {
  option: Filter["values"][0];
  showFiltersCount: boolean;
}) {
  if (showFiltersCount) {
    return (
      <span>
        {option.label} <span className="text-gray-400">({option.count})</span>
      </span>
    );
  }
  return option.label;
}
