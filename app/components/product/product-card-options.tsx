import { Image } from "@shopify/hydrogen";
import { useThemeSettings } from "@weaverse/hydrogen";
import clsx from "clsx";
import type {
  ProductCardFragment,
  ProductVariantFragment,
} from "storefront-api.generated";
import { Button } from "~/components/button";
import { Link } from "~/components/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import { RevealUnderline } from "~/reveal-underline";
import { cn } from "~/utils/cn";
import { isLightColor, isValidColor } from "~/utils/misc";
import { OPTIONS_AS_SWATCH } from "./product-option-values";

export function ProductCardOptions({
  product,
  selectedVariant,
  setSelectedVariant,
}: {
  product: ProductCardFragment;
  selectedVariant: ProductVariantFragment;
  setSelectedVariant: (variant: ProductVariantFragment) => void;
}) {
  const { pcardShowOptionValues, pcardOptionToShow, pcardMaxOptionValues } =
    useThemeSettings();
  const { handle, options } = product;
  const { optionValues } =
    options.find(({ name }) => name === pcardOptionToShow) || {};
  const restCount = optionValues?.length - pcardMaxOptionValues;

  if (!pcardShowOptionValues || !optionValues?.length) {
    return null;
  }

  let selectedValue = "";
  if (selectedVariant) {
    selectedValue = selectedVariant.selectedOptions?.find(
      ({ name }) => name === pcardOptionToShow,
    )?.value;
  }
  const asSwatch = OPTIONS_AS_SWATCH.includes(pcardOptionToShow);

  return (
    <div className="flex flex-wrap items-center gap-1 pt-1">
      {optionValues
        .slice(0, pcardMaxOptionValues)
        .map(({ name, swatch, firstSelectableVariant }) => {
          if (asSwatch) {
            const swatchColor = swatch?.color || name;
            return (
              <Tooltip key={name}>
                <TooltipTrigger>
                  <button
                    type="button"
                    className={cn(
                      "size-4.5 flex aspect-square rounded-full",
                      "transition-all border border-transparent",
                      selectedValue === name ? "p-0.5 border-gray-800" : "p-0",
                    )}
                    onClick={() => {
                      setSelectedVariant(firstSelectableVariant);
                    }}
                  >
                    {swatch?.image?.previewImage ? (
                      <Image
                        data={swatch.image.previewImage}
                        className="w-full h-full object-cover object-center rounded-full"
                        width={200}
                        sizes="auto"
                      />
                    ) : (
                      <span
                        className={clsx(
                          "w-full h-full inline-block text-[0px] rounded-full",
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
                <TooltipContent sideOffset={6}>{name}</TooltipContent>
              </Tooltip>
            );
          }
          return (
            <Button
              key={name}
              variant="outline"
              animate={false}
              className={clsx(
                "px-2 py-1 text-sm text-center border border-line-subtle transition-colors",
                selectedValue === name &&
                  "bg-body border-body text-body-inverse",
              )}
              onClick={() => {
                setSelectedVariant(firstSelectableVariant);
              }}
            >
              {name}
            </Button>
          );
        })}
      {restCount > 0 && (
        <Link to={`/products/${handle}`} className="mt-1">
          <RevealUnderline>+{restCount}</RevealUnderline>
        </Link>
      )}
    </div>
  );
}
