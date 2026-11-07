import * as Select from "@radix-ui/react-select";
import type { ProductFormOptions } from "@shopify/hydrogen";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Icon } from "~/components/icon";
import {
  isPlainClick,
  type ProductFormData,
  productOptionPath,
  useProductForm,
} from "~/components/product/product-form";
import { ShopifyImage } from "~/components/shopify-image";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import { cn } from "~/utils/cn";
import { localizePath, resolveLocale } from "~/utils/locale";
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

type ProductOptionState = ProductFormOptions<ProductFormData>[number];
type OptionValueState = ProductOptionState["values"][number];

/**
 * The values of one product option, bound to the surrounding `ProductProvider`.
 *
 * - `asLinks` (the product page): every existing value is a real link to its
 *   option URL, so the selection is crawlable and works without JavaScript.
 *   Hydrated, a plain click selects the value in the product form instead, and
 *   the provider's `onSelect` syncs the URL without a loader round trip.
 * - Otherwise (quick shop, single-product section): values are buttons that
 *   select in place and leave the page URL alone.
 *
 * Either way, a value that belongs to another product of a combined listing
 * is a link to that product, and a combination that doesn't exist is a
 * disabled button.
 */
export function ProductOptionValues({
  product,
  option,
  asLinks = false,
}: {
  product: ProductFormData;
  option: ProductOptionState;
  asLinks?: boolean;
}) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { register } = useProductForm();
  const { name: optionName, values } = option;
  // The same base the provider's `onSelect` uses, so a link's `href` and the
  // hydrated selection land on the same URL with unrelated params kept.
  const base = new URLSearchParams(search);

  function pathFor(value: OptionValueState) {
    return localizePath(
      productOptionPath(product, value.selectedOptions, value.handle, base),
      resolveLocale(pathname),
    );
  }

  if (OPTIONS_AS_DROPDOWN.includes(optionName)) {
    const selectedValue = values.find((v) => v.selected)?.name;
    return (
      <Select.Root
        value={selectedValue}
        onValueChange={(v) => {
          const found = values.find(({ name }) => name === v);
          if (!found) {
            return;
          }
          if (found.handle !== product.handle) {
            navigate(pathFor(found));
          } else {
            register("optionValue", { optionName, value: v }).onChange();
          }
        }}
      >
        <Select.Trigger
          className="border-line inline-flex h-10 items-center justify-center gap-3 rounded-md border bg-white py-3 pr-3 pl-4 outline-hidden"
          aria-label={optionName}
        >
          <Select.Value />
          <Select.Icon className="shrink-0">
            <Icon name="caret-down" size={16} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="overflow-hidden rounded-lg bg-white shadow-[0px_10px_38px_-10px_rgba(22,23,24,0.35),0px_10px_20px_-15px_rgba(22,23,24,0.2)]">
            <Select.ScrollUpButton className="flex cursor-pointer items-center justify-center hover:bg-gray-100">
              <Icon name="caret-up" size={16} />
            </Select.ScrollUpButton>
            <Select.Viewport className="p-1.5">
              {values.map(({ name: value, selected, available, exists }) => (
                <Select.Item
                  key={value}
                  value={value}
                  disabled={!exists}
                  className={cn(
                    "flex h-10 w-full cursor-pointer items-center justify-between gap-4 py-2.5 pr-2 pl-4 outline-hidden select-none hover:bg-gray-100",
                    !available && "text-body-subtle line-through",
                  )}
                >
                  <Select.ItemText>{value}</Select.ItemText>
                  {selected && (
                    <Select.ItemIndicator className="inline-flex w-6 shrink-0 items-center justify-center">
                      <Icon name="check" size={16} />
                    </Select.ItemIndicator>
                  )}
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton className="hover:bg-info-100 dark:hover:bg-info-700 flex cursor-pointer items-center justify-center rounded-lg">
              <Icon name="caret-down" size={16} />
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
      {values.map((value) => {
        const registered = register("optionValue", {
          optionName,
          value: value.name,
        });
        return (
          <Tooltip key={value.name}>
            <TooltipTrigger>
              <div>
                <OptionValueControl
                  value={value}
                  to={pathFor(value)}
                  crossProduct={value.handle !== product.handle}
                  asLink={asLinks}
                  onSelect={registered.onClick}
                  {...getOptionValueAppearance(product, optionName, value)}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>
              {value.exists ? value.name : `${value.name} (Not available)`}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

/**
 * The element for one option value. Same-product and cross-product values use
 * the same element (a link) on the product page, so the activated control is
 * reconciled in place across a combined-listing navigation and keeps focus.
 */
function OptionValueControl({
  value,
  to,
  crossProduct,
  asLink,
  onSelect,
  className,
  label,
  children,
}: {
  value: OptionValueState;
  to: string;
  crossProduct: boolean;
  asLink: boolean;
  onSelect: () => void;
  className: string;
  label?: string;
  children: ReactNode;
}) {
  if (!(crossProduct || value.exists)) {
    return (
      <button
        type="button"
        disabled
        aria-pressed={value.selected}
        aria-label={label}
        className={className}
      >
        {children}
      </button>
    );
  }

  if (asLink || crossProduct) {
    return (
      <Link
        to={to}
        replace={!crossProduct}
        preventScrollReset
        prefetch={crossProduct ? "intent" : undefined}
        aria-current={value.selected ? "true" : undefined}
        aria-label={label}
        // Laid out like the buttons: an inline link's padding doesn't count
        // toward the line height, so it would sit higher than its siblings.
        className={cn("inline-block", className)}
        onClick={
          crossProduct
            ? undefined
            : (event) => {
                if (!isPlainClick(event)) {
                  return;
                }
                // The provider's `onSelect` owns the URL; stop the link from
                // navigating (and revalidating) a second time.
                event.preventDefault();
                onSelect();
              }
        }
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={value.selected}
      aria-label={label}
      className={className}
      onClick={onSelect}
    >
      {children}
    </button>
  );
}

function getOptionValueAppearance(
  product: ProductFormData,
  optionName: string,
  value: OptionValueState,
): { className: string; label?: string; children: ReactNode } {
  const { name, selected, available, exists, swatch } = value;

  if (OPTIONS_AS_SWATCH.includes(optionName)) {
    const swatchColor = swatch?.color || name;
    return {
      label: name,
      className: cn(
        "flex aspect-square size-(--option-swatch-size)",
        "overflow-hidden rounded-full",
        "outline-1 outline-offset-2 transition-[outline-color]",
        !exists && "cursor-not-allowed",
        selected ? "outline-line" : "hover:outline-line outline-transparent",
        !available && "diagonal",
      ),
      children: swatch?.image?.previewImage ? (
        <ShopifyImage
          data={swatch.image.previewImage}
          className="h-full w-full object-cover object-center"
          width={200}
          sizes="auto"
        />
      ) : (
        <span
          className={cn(
            "block h-full w-full rounded-full text-[0px]",
            (!isValidColor(swatchColor) || isLightColor(swatchColor)) &&
              "border-line-subtle border",
          )}
          style={{ backgroundColor: swatchColor }}
        >
          {name}
        </span>
      ),
    };
  }

  if (OPTIONS_AS_BUTTON.includes(optionName)) {
    return {
      className: cn(
        "border-line-subtle rounded-md border px-4 py-2.5 text-center transition-colors",
        !exists && "cursor-not-allowed",
        selected
          ? [
              available ? "bg-body text-body-inverse" : "text-body-subtle",
              "border-body",
            ]
          : "hover:border-line",
        !available && "diagonal text-body-subtle bg-gray-100",
      ),
      children: name,
    };
  }

  if (OPTIONS_AS_IMAGE.includes(optionName)) {
    const image = product.options
      .find((o) => o.name === optionName)
      ?.optionValues.find((v) => v.name === name)
      ?.firstSelectableVariant?.image;
    return {
      label: name,
      className: cn(
        "flex h-auto w-(--option-image-width) items-center justify-center rounded-md p-1",
        "border-line-subtle border text-center transition-colors",
        !exists && "cursor-not-allowed",
        selected
          ? [
              available ? "text-body-inverse" : "text-body-subtle",
              "border-body",
            ]
          : "hover:border-line",
        !available && "diagonal text-body-subtle opacity-75",
      ),
      children: image ? (
        <ShopifyImage
          data={image}
          sizes="auto"
          width={200}
          className="h-full w-full object-cover object-center"
        />
      ) : (
        <span>{name}</span>
      ),
    };
  }

  // Default fallback
  return {
    className: cn(
      "border-b py-0.5",
      !exists && "cursor-not-allowed",
      selected
        ? [available ? "border-line" : "border-line-subtle"]
        : [
            "border-transparent",
            available ? "hover:border-line" : "hover:border-line-subtle",
          ],
      !available && "text-body-subtle line-through",
    ),
    children: name,
  };
}
