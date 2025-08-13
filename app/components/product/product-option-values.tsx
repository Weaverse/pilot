import { CaretDownIcon, CaretUpIcon, CheckIcon } from "@phosphor-icons/react";
import * as Select from "@radix-ui/react-select";
import { Image, type MappedProductOptions } from "@shopify/hydrogen";
import type { ButtonHTMLAttributes } from "react";
import { useNavigate } from "react-router";
import type { ProductVariantFragment } from "storefront-api.generated";
import Link, { type LinkProps } from "~/components/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import { cn } from "~/utils/cn";
import { isLightColor, isValidColor } from "~/utils/misc";

/*
 * Configure how different product option types are rendered by adding the option name to the appropriate array:
 * - OPTIONS_AS_SWATCH: Renders as color swatches (circular buttons with image/color)
 * - OPTIONS_AS_BUTTON: Renders as rectangular buttons
 * - OPTIONS_AS_IMAGE: Renders as image thumbnails
 * - OPTIONS_AS_DROPDOWN: Renders as a dropdown select menu
 *
 * If an option name is not found in any of these arrays, it will render with the default UI (underlined links).
 */
export const OPTIONS_AS_SWATCH: string[] = [
  "Color",
  "Colors",
  "Colour",
  "Colours",
];
const OPTIONS_AS_BUTTON: string[] = ["Size"];
const OPTIONS_AS_IMAGE: string[] = [];
const OPTIONS_AS_DROPDOWN: string[] = [];

export function ProductOptionValues({
  option,
  onVariantChange,
  combinedListing,
}: {
  option: MappedProductOptions;
  onVariantChange?: (variant: ProductVariantFragment) => void;
  combinedListing?: boolean;
}) {
  const navigate = useNavigate();
  const { name: optionName, optionValues } = option || {};

  if (!optionName) {
    return null;
  }

  if (OPTIONS_AS_DROPDOWN.includes(optionName)) {
    const selectedValue = optionValues.find((v) => v.selected)?.name;
    return (
      <Select.Root
        value={selectedValue}
        onValueChange={(v) => {
          const found = optionValues.find(({ name: value }) => value === v);
          if (found) {
            if (onVariantChange && found.firstSelectableVariant) {
              onVariantChange(found.firstSelectableVariant);
            } else {
              const to = found.isDifferentProduct
                ? `/products/${found.handle}?${found.variantUriQuery}`
                : `?${found.variantUriQuery}`;
              if (found.isDifferentProduct) {
                window.location.href = to;
              } else {
                navigate(to, { replace: true });
              }
            }
          }
        }}
      >
        <Select.Trigger
          className="inline-flex h-10 items-center justify-center gap-3 border border-line bg-white py-3 pr-3 pl-4 outline-hidden"
          aria-label={optionName}
        >
          <Select.Value />
          <Select.Icon className="shrink-0">
            <CaretDownIcon size={16} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="overflow-hidden bg-white shadow-[0px_10px_38px_-10px_rgba(22,23,24,0.35),0px_10px_20px_-15px_rgba(22,23,24,0.2)]">
            <Select.ScrollUpButton className="flex cursor-pointer items-center justify-center hover:bg-gray-100">
              <CaretUpIcon size={16} />
            </Select.ScrollUpButton>
            <Select.Viewport className="p-1.5">
              {optionValues.map(({ name: value, selected, available }) => (
                <Select.Item
                  key={value}
                  value={value}
                  className={cn(
                    "flex h-10 w-full cursor-pointer select-none items-center justify-between gap-4 py-2.5 pr-2 pl-4 outline-hidden hover:bg-gray-100",
                    !available && "text-body-subtle line-through",
                  )}
                >
                  <Select.ItemText>{value}</Select.ItemText>
                  {selected && (
                    <Select.ItemIndicator className="inline-flex w-6 shrink-0 items-center justify-center">
                      <CheckIcon size={16} />
                    </Select.ItemIndicator>
                  )}
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton className="flex cursor-pointer items-center justify-center rounded-lg hover:bg-info-100 dark:hover:bg-info-700">
              <CaretDownIcon size={16} />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap gap-3",
        OPTIONS_AS_SWATCH.includes(optionName) && "pt-0.5",
      )}
    >
      {optionValues.map((optionValue) => {
        return (
          <Tooltip key={optionValue.name}>
            <TooltipTrigger>
              <div>
                <OptionValue
                  optionName={optionName}
                  value={optionValue}
                  onVariantChange={onVariantChange}
                  combinedListing={combinedListing}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>
              {optionValue.exists
                ? optionValue.name
                : `${optionValue.name} (Not available)`}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

function OptionValue({
  optionName,
  value,
  onVariantChange,
  combinedListing,
}: {
  optionName: string;
  value: MappedProductOptions["optionValues"][number];
  onVariantChange?: (variant: ProductVariantFragment) => void;
  combinedListing?: boolean;
}) {
  const navigate = useNavigate();
  const {
    name,
    variantUriQuery,
    selected,
    available,
    exists,
    isDifferentProduct,
    firstSelectableVariant,
    handle,
    swatch,
  } = value;

  const to = isDifferentProduct
    ? `/products/${handle}?${variantUriQuery}`
    : `?${variantUriQuery}`;
  const linkProps: LinkProps = {
    to,
    preventScrollReset: true,
    prefetch: "intent",
    replace: !combinedListing,
  };
  const buttonProps: ButtonHTMLAttributes<HTMLButtonElement> = {
    type: "button" as const,
    disabled: !exists,
    onClick: () => {
      if (onVariantChange && firstSelectableVariant) {
        onVariantChange(firstSelectableVariant);
      } else if (!selected && exists) {
        navigate(to, { replace: true });
      }
    },
  };

  /*
   * - When onVariantChange is provided, which mean the variant is being managed by the parent component,
   * we always render as a button.
   * - When the variant is a combined listing child product that leads to a different URL,
   * we need to render it as an anchor tag.
   * - When the variant is an update to the search param, render it as a button with JavaScript navigating to
   * the variant so that SEO bots do not index these as duplicated links.
   */
  const Component = onVariantChange
    ? "button"
    : isDifferentProduct
      ? Link
      : "button";
  const componentProps = onVariantChange
    ? buttonProps
    : isDifferentProduct
      ? linkProps
      : buttonProps;

  if (OPTIONS_AS_SWATCH.includes(optionName)) {
    const swatchColor = swatch?.color || name;
    return (
      // @ts-expect-error: TypeScript cannot infer the correct props for variable component
      <Component
        {...componentProps}
        className={cn(
          "flex aspect-square size-(--option-swatch-size)",
          "overflow-hidden rounded-full",
          "outline-1 outline-offset-2 transition-[outline-color]",
          !exists && "cursor-not-allowed",
          selected && !combinedListing
            ? "outline-line"
            : "outline-transparent hover:outline-line",
          !available && "diagonal",
        )}
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
            className={cn(
              "inline-block h-full w-full rounded-full text-[0px]",
              (!isValidColor(swatchColor) || isLightColor(swatchColor)) &&
                "border border-line-subtle",
            )}
            style={{ backgroundColor: swatchColor }}
          >
            {name}
          </span>
        )}
      </Component>
    );
  }

  if (OPTIONS_AS_BUTTON.includes(optionName)) {
    return (
      // @ts-expect-error: TypeScript cannot infer the correct props for variable component
      <Component
        {...componentProps}
        className={cn(
          "border border-line-subtle px-4 py-2.5 text-center transition-colors",
          !exists && "cursor-not-allowed",
          selected && !combinedListing
            ? [
                available ? "bg-body text-body-inverse" : "text-body-subtle",
                "border-body",
              ]
            : "hover:border-line",
          !available && "diagonal bg-gray-100 text-body-subtle",
        )}
      >
        {name}
      </Component>
    );
  }

  if (OPTIONS_AS_IMAGE.includes(optionName)) {
    return (
      // @ts-expect-error: TypeScript cannot infer the correct props for variable component
      <Component
        {...componentProps}
        className={cn(
          "flex h-auto w-(--option-image-width) items-center justify-center p-1",
          "border border-line-subtle text-center transition-colors",
          !exists && "cursor-not-allowed",
          selected && !combinedListing
            ? [
                available ? "text-body-inverse" : "text-body-subtle",
                "border-body",
              ]
            : "hover:border-line",
          !available && "diagonal text-body-subtle opacity-75",
        )}
      >
        {firstSelectableVariant?.image ? (
          <Image
            data={firstSelectableVariant?.image}
            sizes="auto"
            width={200}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <span>{name}</span>
        )}
      </Component>
    );
  }

  // Default fallback
  return (
    // @ts-expect-error: TypeScript cannot infer the correct props for variable component
    <Component
      {...componentProps}
      className={cn(
        "border-b py-0.5",
        !exists && "cursor-not-allowed",
        selected && !combinedListing
          ? [available ? "border-line" : "border-line-subtle"]
          : [
              "border-transparent",
              available ? "hover:border-line" : "hover:border-line-subtle",
            ],
        !available && "text-body-subtle line-through",
      )}
    >
      {name}
    </Component>
  );
}
