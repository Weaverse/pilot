import * as Checkbox from "@radix-ui/react-checkbox";
import type { Filter } from "@shopify/hydrogen/storefront-api-types";
import { Suspense, use, useState } from "react";
import {
  useLocation,
  useNavigate,
  useRouteLoaderData,
  useSearchParams,
} from "react-router";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import type { RootLoader } from "~/root";
import type { AppliedFilter } from "~/types/others";
import { cn } from "~/utils/cn";
import { getAppliedFilterLink, getFilterLink } from "./filter-utils";

type FilterDisplayAs = "swatch" | "button" | "list-item";

export function FilterItem({
  displayAs,
  option,
  appliedFilters,
  showFiltersCount,
}: {
  displayAs: FilterDisplayAs;
  option: Filter["values"][0];
  appliedFilters: AppliedFilter[];
  showFiltersCount: boolean;
}) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const location = useLocation();
  let rootData = useRouteLoaderData<RootLoader>("root");

  const filter = appliedFilters.find(
    (flt) => JSON.stringify(flt.filter) === option.input,
  );

  const [checked, setChecked] = useState(Boolean(filter));

  function handleCheckedChange(newChecked: boolean) {
    setChecked(newChecked);
    if (newChecked) {
      const link = getFilterLink(option.input as string, params, location);
      navigate(link, { preventScrollReset: true });
    } else if (filter) {
      const link = getAppliedFilterLink(filter, params, location);
      navigate(link, { preventScrollReset: true });
    }
  }

  if (displayAs === "swatch") {
    return (
      <Suspense
        fallback={
          <span className="h-10 w-10 animate-pulse border border-line-subtle bg-background" />
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
          "border px-3 py-1.5 text-center disabled:cursor-not-allowed",
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
          "h-5 w-5 shrink-0",
          "border border-line focus-visible:outline-hidden",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <Checkbox.Indicator className="flex items-center justify-center text-current">
          <span className="inline-block h-3 w-3 bg-body" />
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
            "h-10 w-10 disabled:cursor-not-allowed",
            "border hover:border-body",
            checked ? "border-line p-1" : "border-line-subtle",
            option.count === 0 && "diagonal",
          )}
          onClick={() => onCheckedChange(!checked)}
          disabled={option.count === 0}
        >
          <span
            className="inline-block h-full w-full"
            style={{
              backgroundImage: swatchImage?.value
                ? `url(${swatchImage?.value})`
                : undefined,
              backgroundSize: "cover",
              backgroundColor:
                swatchColor?.value || option.label.toLowerCase(),
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
        {option.label} <span>({option.count})</span>
      </span>
    );
  }
  return option.label;
}
