import { CaretDownIcon, CaretUpIcon, CheckIcon } from "@phosphor-icons/react";
import * as Select from "@radix-ui/react-select";
import { Image, type MappedProductOptions } from "@shopify/hydrogen";
import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";
import { useNavigate } from "react-router";
import Link, { type LinkProps } from "~/components/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
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
export const OPTIONS_AS_SWATCH = ["Color", "Colors", "Colour", "Colours"];
const OPTIONS_AS_BUTTON = ["Size"];
const OPTIONS_AS_IMAGE = [];
const OPTIONS_AS_DROPDOWN = [];

/*
 * SEO: When the variant is a combined listing child product that leads to a different URL,
 * we need to render it as an anchor tag.
 * When the variant is an update to the search param, render it as a button with JavaScript navigating to
 * the variant so that SEO bots do not index these as duplicated links.
 */

export function ProductOptionValues({
  option,
}: {
  option: MappedProductOptions;
}) {
  const navigate = useNavigate();
  const { name: optionName, optionValues } = option || {};

  if (!optionName) return null;

  if (OPTIONS_AS_DROPDOWN.includes(optionName)) {
    const selectedValue = optionValues.find((v) => v.selected)?.name;
    return (
      <Select.Root
        value={selectedValue}
        onValueChange={(v) => {
          const found = optionValues.find(({ name: value }) => value === v);
          if (found) {
            const to = found.isDifferentProduct
              ? `/products/${found.handle}?${found.variantUriQuery}`
              : `?${found.variantUriQuery}`;
            if (found.isDifferentProduct) {
              window.location.href = to;
            } else {
              navigate(to, { replace: true });
            }
          }
        }}
      >
        <Select.Trigger
          className="inline-flex border border-line h-10 items-center justify-center gap-3 bg-white pl-4 pr-3 py-3 outline-hidden"
          aria-label={optionName}
        >
          <Select.Value />
          <Select.Icon className="shrink-0">
            <CaretDownIcon size={16} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="overflow-hidden bg-white shadow-[0px_10px_38px_-10px_rgba(22,23,24,0.35),0px_10px_20px_-15px_rgba(22,23,24,0.2)]">
            <Select.ScrollUpButton className="cursor-pointer flex items-center justify-center hover:bg-gray-100">
              <CaretUpIcon size={16} />
            </Select.ScrollUpButton>
            <Select.Viewport className="p-1.5">
              {optionValues.map(({ name: value, selected, available }) => (
                <Select.Item
                  key={value}
                  value={value}
                  className={clsx(
                    "flex gap-4 cursor-pointer w-full items-center justify-between hover:bg-gray-100 outline-hidden h-10 select-none pl-4 pr-2 py-2.5",
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
            <Select.ScrollDownButton className="cursor-pointer flex items-center justify-center rounded-lg hover:bg-info-100 dark:hover:bg-info-700">
              <CaretDownIcon size={16} />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {optionValues.map((optionValue) => {
        return (
          <Tooltip key={optionValue.name}>
            <TooltipTrigger>
              <div>
                <OptionValue optionName={optionName} value={optionValue} />
              </div>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>{optionValue.name}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

function OptionValue({
  optionName,
  value,
}: {
  optionName: string;
  value: MappedProductOptions["optionValues"][number];
}) {
  const navigate = useNavigate();
  let {
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
  const Component = isDifferentProduct ? Link : "button";
  const linkProps: LinkProps = {
    to,
    preventScrollReset: true,
    prefetch: "intent",
    replace: true,
  };
  const buttonProps: ButtonHTMLAttributes<HTMLButtonElement> = {
    type: "button" as const,
    disabled: !available,
    onClick: () => {
      if (!selected && exists) {
        navigate(to, { replace: true });
      }
    },
  };

  if (OPTIONS_AS_SWATCH.includes(optionName)) {
    const swatchColor = swatch?.color || name;
    return (
      // @ts-expect-error: TypeScript cannot infer the correct props for variable component
      <Component
        {...(isDifferentProduct ? linkProps : buttonProps)}
        className={clsx(
          "size-(--option-swatch-size) flex aspect-square cursor-pointer",
          "rounded-full overflow-hidden",
          "transition-[outline-color] outline-offset-2 outline-1",
          selected ? "outline-line" : "outline-transparent hover:outline-line",
          !available && "diagonal",
        )}
      >
        {swatch?.image?.previewImage ? (
          <Image
            data={swatch.image.previewImage}
            className="w-full h-full object-cover object-center"
            width={200}
            sizes="auto"
          />
        ) : (
          <span
            className={clsx(
              "w-full h-full inline-block text-[0px] rounded-full",
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
        {...(isDifferentProduct ? linkProps : buttonProps)}
        className={clsx(
          "px-4 py-2.5 text-center border border-line-subtle transition-colors",
          selected
            ? [
                available ? "text-body-inverse bg-body" : "text-body-subtle",
                "border-body",
              ]
            : "hover:border-line",
          !available && "text-body-subtle diagonal bg-gray-100",
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
        {...(isDifferentProduct ? linkProps : buttonProps)}
        className={clsx(
          "flex items-center justify-center p-1 w-(--option-image-width) h-auto",
          "text-center border border-line-subtle transition-colors",
          selected
            ? [
                available ? "text-body-inverse" : "text-body-subtle",
                "border-body",
              ]
            : "hover:border-line",
          !available && "text-body-subtle diagonal opacity-75",
        )}
      >
        {firstSelectableVariant?.image ? (
          <Image
            data={firstSelectableVariant?.image}
            sizes="auto"
            width={200}
            className="w-full h-full object-cover object-center"
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
      {...(isDifferentProduct ? linkProps : buttonProps)}
      className={clsx(
        "py-0.5 cursor-pointer border-b",
        selected
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
