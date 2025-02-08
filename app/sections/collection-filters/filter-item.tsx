import * as Checkbox from "@radix-ui/react-checkbox";
import {
  useLocation,
  useNavigate,
  useRouteLoaderData,
  useSearchParams,
} from "@remix-run/react";
import type { Filter } from "@shopify/hydrogen/storefront-api-types";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import type { RootLoader } from "~/root";
import { cn } from "~/utils/cn";
import type { AppliedFilter } from "~/utils/filter";
import { getAppliedFilterLink, getFilterLink } from "~/utils/filter";

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
  let navigate = useNavigate();
  let [params] = useSearchParams();
  let location = useLocation();
  let { swatchesConfigs } = useRouteLoaderData<RootLoader>("root");

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

  if (displayAs === "swatch") {
    let { colors, images } = swatchesConfigs;
    let swatchImage = images.find(({ name }) => name === option.label);
    let swatchColor = colors.find(({ name }) => name === option.label);

    return (
      <Tooltip>
        <TooltipTrigger>
          <button
            type="button"
            className={cn(
              "w-10 h-10 disabled:cursor-not-allowed",
              "border hover:border-body",
              checked ? "p-1 border-line" : "border-line-subtle",
              option.count === 0 && "diagonal",
            )}
            onClick={() => handleCheckedChange(!checked)}
            disabled={option.count === 0}
          >
            <span
              className="w-full h-full inline-block"
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

  if (displayAs === "button") {
    return (
      <button
        type="button"
        className={cn(
          "px-3 py-1.5 border text-center disabled:cursor-not-allowed",
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
          "w-5 h-5 shrink-0",
          "border border-line focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <Checkbox.Indicator className="flex items-center justify-center text-current">
          <span className="inline-block w-3 h-3 bg-body" />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <FilterLabel option={option} showFiltersCount={showFiltersCount} />
    </div>
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
