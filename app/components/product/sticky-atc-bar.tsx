import {
  getAdjacentAndFirstAvailableVariants,
  Image,
  useOptimisticVariant,
} from "@shopify/hydrogen";
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
}

export function StickyATCBar({
  addToCartText = "Add to cart",
  addBundleToCartText = "Add bundle to cart",
}: StickyATCBarProps) {
  const { product } = useLoaderData<typeof productRouteLoader>();
  const { quantity } = useProductQtyStore();
  const { inView } = useATCVisibilityStore();

  const selectedVariant = useOptimisticVariant(
    product?.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  if (!product || !selectedVariant) {
    return null;
  }

  const isBundle = Boolean(product.isBundle?.requiresComponents);
  const variantImage =
    selectedVariant.image || product.media?.nodes?.[0]?.previewImage;
  let show = !inView && selectedVariant.availableForSale;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "border-t border-line-subtle bg-background shadow-[0_-2px_10px_rgba(0,0,0,0.08)]",
        "transition-transform duration-300 ease-in-out",
        show ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="mx-auto flex max-w-screen-xl items-center gap-4 px-4 py-3">
        {variantImage && (
          <Image
            data={variantImage}
            width={56}
            height={56}
            className="hidden shrink-0 rounded border border-line-subtle object-cover sm:block"
            sizes="56px"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{product.title}</p>
          <VariantPrices variant={selectedVariant} className="text-sm" />
        </div>
        <AddToCartButton
          disabled={!selectedVariant.availableForSale}
          lines={[
            {
              merchandiseId: selectedVariant.id,
              quantity,
              selectedVariant,
            },
          ]}
          className="shrink-0 whitespace-nowrap uppercase"
        >
          {isBundle ? addBundleToCartText : addToCartText}
        </AddToCartButton>
      </div>
    </div>
  );
}
