import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  getAdjacentAndFirstAvailableVariants,
  useOptimisticVariant,
} from "@shopify/hydrogen";
import { useEffect, useState } from "react";
import { useLoaderData } from "react-router";
import { Image } from "~/components/image";
import { AddToCartButton } from "~/components/product/add-to-cart-button";
import { VariantPrices } from "~/components/product/variant-prices";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { cn } from "~/utils/cn";
import { hasOnlyDefaultVariant } from "~/utils/product";
import { useProductQtyStore } from "../product-quantity-selector";
import { useATCVisibilityStore } from "./store";

interface StickyATCBarProps {
  addToCartText?: string;
  addBundleToCartText?: string;
  barWidth?: "full" | "narrow";
  showImage?: boolean;
}

// Mobile breakpoint (matches Tailwind's md breakpoint)
const MOBILE_BREAKPOINT = 768;

export function StickyATCBar({
  addToCartText = "Add to cart",
  addBundleToCartText = "Add bundle to cart",
  barWidth = "narrow",
  showImage = true,
}: StickyATCBarProps) {
  const { product } = useLoaderData<typeof productRouteLoader>();
  const { quantity } = useProductQtyStore();
  const { inView, scrolledPast } = useATCVisibilityStore();
  const [isMobile, setIsMobile] = useState(false);
  const [footerInView, setFooterInView] = useState(false);

  // Track screen size
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Hide sticky bar when footer is visible
  useEffect(() => {
    let footer = document.querySelector("footer");
    if (!footer) {
      return;
    }

    let observer = new IntersectionObserver(
      ([entry]) => setFooterInView(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(footer);

    return () => observer.disconnect();
  }, []);

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
  let show =
    !inView &&
    !footerInView &&
    (!isMobile || scrolledPast) &&
    selectedVariant.availableForSale;

  let hasMultipleVariants = !hasOnlyDefaultVariant(product.options);

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
            "transition-transform duration-500 ease-in-out",
            "data-[state=open]:translate-y-0 data-[state=closed]:translate-y-[200%]",
            "data-[state=closed]:pointer-events-none",
            barWidth === "narrow" ? "sm:pb-3 sm:px-3" : "",
          )}
          aria-describedby={undefined}
        >
          <VisuallyHidden.Root asChild>
            <Dialog.Title>Sticky add to cart bar</Dialog.Title>
          </VisuallyHidden.Root>
          <div
            onClick={handleBarClick}
            className={cn(
              "cursor-pointer w-full",
              "bg-background border-t sm:border border-gray-200 shadow-[0_-6px_20px_rgba(0,0,0,0.15)]",
              "md:flex items-center justify-between gap-30 p-3 space-y-2 sm:space-y-0",
              barWidth === "narrow" ? "sm:w-fit sm:rounded-md" : "",
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              {showImage && variantImage && (
                <Image
                  data={variantImage}
                  width={200}
                  height={200}
                  className="hidden shrink-0 rounded-md object-cover sm:block size-15"
                  sizes="auto"
                />
              )}
              <div className="min-w-0 flex flex-wrap sm:block gap-2 text-lg md:text-base">
                <p className="truncate font-medium">{product.title}</p>
                <span className="text-body-subtle sm:hidden">·</span>
                <div className="flex items-center gap-2">
                  <VariantPrices variant={selectedVariant} />
                  {hasMultipleVariants && (
                    <>
                      <span className="text-body-subtle">·</span>
                      <span className="text-body-subtle">{selectedLabel}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <AddToCartButton
                disabled={!selectedVariant.availableForSale}
                lines={[
                  {
                    merchandiseId: selectedVariant.id,
                    quantity,
                    selectedVariant,
                  },
                ]}
                className="whitespace-nowrap px-3 md:px-16"
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
