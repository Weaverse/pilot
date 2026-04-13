import { CaretDownIcon, CaretUpIcon, CheckIcon } from "@phosphor-icons/react";
import * as Select from "@radix-ui/react-select";
import {
  getAdjacentAndFirstAvailableVariants,
  Image,
  useOptimisticVariant,
} from "@shopify/hydrogen";
import { useNavigate } from "react-router";
import { useLoaderData } from "react-router";
import { AddToCartButton } from "~/components/product/add-to-cart-button";
import { VariantPrices } from "~/components/product/variant-prices";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { useATCVisibilityStore } from "~/sections/main-product/product-atc-buttons";
import { useProductQtyStore } from "~/sections/main-product/product-quantity-selector";
import { cn } from "~/utils/cn";

interface StickyATCBarProps {
  addToCartText?: string;
  addBundleToCartText?: string;
  barWidth?: "full" | "narrow";
  showImage?: boolean;
  showBuyNowButton?: boolean;
  buyNowText?: string;
}

export function StickyATCBar({
  addToCartText = "Add to cart",
  addBundleToCartText = "Add bundle to cart",
  barWidth = "narrow",
  showImage = true,
  showBuyNowButton = false,
  buyNowText = "Buy now",
}: StickyATCBarProps) {
  const { product } = useLoaderData<typeof productRouteLoader>();
  const { quantity } = useProductQtyStore();
  const { inView } = useATCVisibilityStore();
  const navigate = useNavigate();

  const allVariants = getAdjacentAndFirstAvailableVariants(product);
  const selectedVariant = useOptimisticVariant(
    product?.selectedOrFirstAvailableVariant,
    allVariants,
  );

  if (!product || !selectedVariant) {
    return null;
  }

  const isBundle = Boolean(product.isBundle?.requiresComponents);
  const variantImage =
    selectedVariant.image || product.media?.nodes?.[0]?.previewImage;
  let show = !inView && selectedVariant.availableForSale;

  let hasMultipleVariants =
    allVariants.length > 1 ||
    (product.options && product.options.length > 1) ||
    (product.options?.length === 1 &&
      (product.options[0]?.optionValues?.length ?? 0) > 1);

  let selectedLabel = selectedVariant.selectedOptions
    .map((o) => o.value)
    .join(" / ");

  function handleVariantChange(variantId: string) {
    let variant = allVariants.find((v) => v.id === variantId);
    if (variant?.selectedOptions) {
      let params = new URLSearchParams(window.location.search);
      for (let option of variant.selectedOptions) {
        params.set(option.name, option.value);
      }
      navigate(`${window.location.pathname}?${params.toString()}`, {
        replace: true,
        preventScrollReset: true,
      });
    }
  }

  function handleBuyNow() {
    let checkoutUrl = `/cart?${new URLSearchParams({
      merchandiseId: selectedVariant.id,
      quantity: String(quantity),
      redirect: "checkout",
    }).toString()}`;
    navigate(checkoutUrl);
  }

  return (
    <div
      className={cn(
        "fixed z-9",
        "bg-background shadow-[0_-4px_20px_rgba(0,0,0,0.1)]",
        "transition-transform duration-300 ease-in-out",
        show ? "translate-y-0" : "translate-y-[200%]",
        barWidth === "narrow"
          ? "bottom-3 left-[20%] right-[20%] rounded-lg"
          : "bottom-0 left-0 right-0",
      )}
    >
      <div className="flex items-center gap-3 px-4 py-2.5">
        {showImage && variantImage && (
          <Image
            data={variantImage}
            width={48}
            height={48}
            className="hidden shrink-0 rounded border border-line-subtle object-cover sm:block"
            sizes="48px"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{product.title}</p>
          <VariantPrices variant={selectedVariant} className="text-xs" />
        </div>
        {hasMultipleVariants && (
          <div className="hidden shrink-0 sm:block">
            <Select.Root
              value={selectedVariant.id}
              onValueChange={handleVariantChange}
            >
              <Select.Trigger
                className={cn(
                  "inline-flex items-center justify-center gap-2",
                  "rounded border border-line-subtle bg-background px-2.5 py-1.5 text-xs",
                  "outline-hidden",
                )}
                aria-label="Select variant"
              >
                <Select.Value>{selectedLabel}</Select.Value>
                <Select.Icon className="shrink-0">
                  <CaretDownIcon size={12} />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content
                  position="popper"
                  side="top"
                  sideOffset={8}
                  className={cn(
                    "z-9 overflow-hidden rounded-lg bg-background",
                    "shadow-[0px_10px_38px_-10px_rgba(22,23,24,0.35),0px_10px_20px_-15px_rgba(22,23,24,0.2)]",
                  )}
                >
                  <Select.ScrollUpButton className="flex cursor-pointer items-center justify-center py-1 hover:bg-gray-100">
                    <CaretUpIcon size={12} />
                  </Select.ScrollUpButton>
                  <Select.Viewport className="p-1">
                    {allVariants.map((variant) => {
                      let label = variant.selectedOptions
                        .map((o) => o.value)
                        .join(" / ");
                      return (
                        <Select.Item
                          key={variant.id}
                          value={variant.id}
                          disabled={!variant.availableForSale}
                          className={cn(
                            "flex cursor-pointer select-none items-center justify-between gap-3",
                            "rounded px-3 py-1.5 text-xs outline-hidden",
                            "data-highlighted:bg-gray-100",
                            !variant.availableForSale &&
                              "text-body-subtle line-through",
                          )}
                        >
                          <Select.ItemText>
                            {label}
                            {!variant.availableForSale ? " (Sold out)" : ""}
                          </Select.ItemText>
                          <Select.ItemIndicator className="inline-flex w-4 shrink-0 items-center justify-center">
                            <CheckIcon size={12} />
                          </Select.ItemIndicator>
                        </Select.Item>
                      );
                    })}
                  </Select.Viewport>
                  <Select.ScrollDownButton className="flex cursor-pointer items-center justify-center py-1 hover:bg-gray-100">
                    <CaretDownIcon size={12} />
                  </Select.ScrollDownButton>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>
        )}
        <div className="flex shrink-0 items-center gap-2">
          <AddToCartButton
            disabled={!selectedVariant.availableForSale}
            lines={[
              {
                merchandiseId: selectedVariant.id,
                quantity,
                selectedVariant,
              },
            ]}
            className="whitespace-nowrap px-3 py-2 text-sm uppercase"
          >
            {isBundle ? addBundleToCartText : addToCartText}
          </AddToCartButton>
          {showBuyNowButton && (
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!selectedVariant.availableForSale}
              className={cn(
                "whitespace-nowrap rounded-md border-2 px-3 py-2 text-sm font-normal uppercase",
                "border-(--btn-outline-text) text-(--btn-outline-text)",
                "hover:bg-(--btn-outline-bg-hover)",
                "transition-colors disabled:cursor-not-allowed disabled:opacity-50!",
              )}
            >
              {buyNowText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
