import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  getAdjacentAndFirstAvailableVariants,
  useOptimisticVariant,
} from "@shopify/hydrogen";
import { useLoaderData } from "react-router";
import { Image } from "~/components/image";
import { AddToCartButton } from "~/components/product/add-to-cart-button";
import { VariantPrices } from "~/components/product/variant-prices";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { useATCVisibilityStore } from "~/sections/main-product/product-buy-buttons";
import { useProductQtyStore } from "~/sections/main-product/product-quantity-selector";
import { cn } from "~/utils/cn";

interface StickyATCBarProps {
  addToCartText?: string;
  addBundleToCartText?: string;
  barWidth?: "full" | "narrow";
  showImage?: boolean;
}

export function StickyATCBar({
  addToCartText = "Add to cart",
  addBundleToCartText = "Add bundle to cart",
  barWidth = "narrow",
  showImage = true,
}: StickyATCBarProps) {
  const { product } = useLoaderData<typeof productRouteLoader>();
  const { quantity } = useProductQtyStore();
  const { inView } = useATCVisibilityStore();

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

  function handleBarClick(e: React.MouseEvent<HTMLDivElement>) {
    let target = e.target as HTMLElement;
    if (target.closest("button, a")) {
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <Dialog.Root open={show} modal={false}>
      <Dialog.Portal forceMount>
        <Dialog.Content
          forceMount
          onInteractOutside={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className={cn(
            "fixed bottom-0 left-0 right-0 z-9",
            "flex justify-center",
            "transition-transform duration-300 ease-in-out",
            "data-[state=open]:translate-y-0 data-[state=closed]:translate-y-[200%]",
            "data-[state=closed]:pointer-events-none",
            barWidth === "narrow" ? "pb-3 px-3" : "",
          )}
          aria-describedby={undefined}
        >
          <VisuallyHidden.Root asChild>
            <Dialog.Title>Sticky add to cart bar</Dialog.Title>
          </VisuallyHidden.Root>
          <div
            onClick={handleBarClick}
            className={cn(
              "cursor-pointer",
              "bg-background border border-gray-200 shadow-[0_-6px_20px_rgba(0,0,0,0.15)]",
              "flex items-center justify-between gap-30 px-4 py-2.5",
              barWidth === "narrow" ? "w-fit rounded-md" : "w-full",
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              {showImage && variantImage && (
                <Image
                  data={variantImage}
                  width={200}
                  height={200}
                  className="hidden shrink-0 rounded-md object-cover sm:block size-16"
                  sizes="auto"
                />
              )}
              <div className="min-w-0">
                <p className="truncate font-medium">{product.title}</p>
                <div className="flex items-center gap-1.5">
                  <VariantPrices
                    variant={selectedVariant}
                    className="text-base"
                  />
                  {hasMultipleVariants && (
                    <>
                      <span className="text-body-subtle">·</span>
                      <span className="text-body-subtle">{selectedLabel}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <AddToCartButton
                disabled={!selectedVariant.availableForSale}
                lines={[
                  {
                    merchandiseId: selectedVariant.id,
                    quantity,
                    selectedVariant,
                  },
                ]}
                className="whitespace-nowrap px-16"
              >
                {isBundle ? addBundleToCartText : addToCartText}
              </AddToCartButton>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
