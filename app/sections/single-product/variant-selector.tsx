import { Image, type MappedProductOptions } from "@shopify/hydrogen";
import clsx from "clsx";
import type { ProductVariantFragment } from "storefront-api.generated";
import { Button } from "~/components/button";
import { OPTIONS_AS_SWATCH } from "~/components/product/product-option-values";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import { isLightColor, isValidColor } from "~/utils/misc";

export function SingleProductVariantSelector({
  option,
  selectedVariant,
  onVariantChange,
}: {
  option: MappedProductOptions;
  selectedVariant: ProductVariantFragment | null;
  onVariantChange: (variant: ProductVariantFragment) => void;
}) {
  const { name: optionName, optionValues } = option || {};

  if (!optionName) return null;

  // Get the selected value for this option
  let selectedValue = "";
  if (selectedVariant) {
    selectedValue =
      selectedVariant.selectedOptions?.find(({ name }) => name === optionName)
        ?.value || "";
  }

  const asSwatch = OPTIONS_AS_SWATCH.includes(optionName);

  return (
    <div className="flex flex-wrap gap-3">
      {optionValues.map((optionValue) => {
        const {
          name,
          selected,
          available,
          exists,
          firstSelectableVariant,
          swatch,
        } = optionValue;

        if (asSwatch) {
          const swatchColor = swatch?.color || name;
          return (
            <Tooltip key={name}>
              <TooltipTrigger>
                <button
                  type="button"
                  disabled={!exists}
                  className={clsx(
                    "flex aspect-square size-(--option-swatch-size)",
                    "overflow-hidden rounded-full",
                    "outline-1 outline-offset-2 transition-[outline-color]",
                    !exists && "cursor-not-allowed",
                    selected
                      ? "outline-line"
                      : "outline-transparent hover:outline-line",
                    !available && "diagonal",
                  )}
                  onClick={() => {
                    if (exists && firstSelectableVariant && !selected) {
                      onVariantChange(firstSelectableVariant);
                    }
                  }}
                >
                  {swatch?.image?.previewImage ? (
                    <Image
                      data={swatch.image.previewImage}
                      className="h-full w-full object-cover object-center"
                      width={200}
                      sizes="auto"
                    />
                  ) : (
                    <span
                      className={clsx(
                        "inline-block h-full w-full rounded-full text-[0px]",
                        (!isValidColor(swatchColor) ||
                          isLightColor(swatchColor)) &&
                          "border border-line-subtle",
                      )}
                      style={{ backgroundColor: swatchColor }}
                    >
                      {name}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>
                {exists ? name : `${name} (Not available)`}
              </TooltipContent>
            </Tooltip>
          );
        }

        // Button style for non-swatch options
        return (
          <Tooltip key={name}>
            <TooltipTrigger>
              <Button
                type="button"
                disabled={!exists}
                variant="outline"
                animate={false}
                className={clsx(
                  "border border-line-subtle px-4 py-2.5 text-center transition-colors",
                  !exists && "cursor-not-allowed",
                  selected
                    ? [
                        available
                          ? "bg-body text-body-inverse"
                          : "text-body-subtle",
                        "border-body",
                      ]
                    : "hover:border-line",
                  !available && "diagonal bg-gray-100 text-body-subtle",
                )}
                onClick={() => {
                  if (exists && firstSelectableVariant && !selected) {
                    onVariantChange(firstSelectableVariant);
                  }
                }}
              >
                {name}
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>
              {exists ? name : `${name} (Not available)`}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
