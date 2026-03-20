import {
  HandbagSimpleIcon,
  ImageIcon,
  ShoppingCartIcon,
  XIcon,
} from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { ShopPayButton } from "@shopify/hydrogen";
import { useThemeSettings } from "@weaverse/hydrogen";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import type {
  ProductQuery,
  ProductVariantFragment,
} from "storefront-api.generated";
import { Button } from "~/components/button";
import { Link } from "~/components/link";
import { AddToCartButton } from "~/components/product/add-to-cart-button";
import { ProductBadges } from "~/components/product/badges";
import { Quantity } from "~/components/product/quantity";
import { VariantPrices } from "~/components/product/variant-prices";
import { VariantSelector } from "~/components/product/variant-selector";
import { ProductMedia } from "~/components/product-media";
import { Skeleton } from "~/components/skeleton";
import JudgemeStarsRating from "~/sections/main-product/judgeme-stars-rating";

interface QuickViewData {
  product: NonNullable<ProductQuery["product"]>;
  variants: ProductVariantFragment[];
  storeDomain: string;
}

interface QuickShopProps {
  data: QuickViewData;
  panelType?: "modal" | "drawer";
}

export function QuickShop({ data, panelType = "modal" }: QuickShopProps) {
  const { product, variants, storeDomain } = data || {};
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantFragment>(product?.selectedOrFirstAvailableVariant);

  const {
    quickShopGroupMediaByVariant,
    quickShopGroupByOption,
    pcardImageRatio,
  } = useThemeSettings();

  return (
    <div className="bg-background">
      <div
        className={clsx(
          "grid grid-cols-1 items-start gap-5",
          panelType === "modal" ? "lg:grid-cols-2" : "grid-cols-1",
        )}
      >
        <div className="relative min-w-0">
          <ProductMedia
            mediaLayout="slider"
            media={product?.media.nodes}
            selectedVariant={selectedVariant}
            showThumbnails={false}
            groupMediaByVariant={quickShopGroupMediaByVariant}
            groupByOption={quickShopGroupByOption}
            product={product}
            imageAspectRatio={pcardImageRatio}
          />
          <ProductBadges
            product={product}
            selectedVariant={selectedVariant}
            className="absolute top-4 left-4 z-10"
          />
        </div>
        <div
          className={clsx(
            "flex flex-col justify-start gap-5",
            panelType === "drawer" ? "pb-5 px-5" : "py-6 pr-5",
          )}
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <h5>{product.title}</h5>
            </div>
            <VariantPrices variant={selectedVariant} />
            <JudgemeStarsRating
              productHandle={product.handle}
              ratingText="{{rating}} ({{total_reviews}} reviews)"
              errorText=""
            />
            {product.summary && (
              <p className="leading-relaxed">{product.summary}</p>
            )}
            <VariantSelector
              product={product}
              selectedVariant={selectedVariant}
              setSelectedVariant={setSelectedVariant}
              variants={variants}
            />
          </div>
          <Quantity value={quantity} onChange={setQuantity} />
          {/* TODO: fix quick-shop modal & cart drawer overlap each other */}
          <AddToCartButton
            disabled={!selectedVariant?.availableForSale}
            lines={[
              {
                merchandiseId: selectedVariant?.id,
                quantity,
                selectedVariant,
              },
            ]}
            data-test="add-to-cart"
            className="w-full"
          >
            {selectedVariant?.availableForSale ? "Add to cart" : "Sold out"}
          </AddToCartButton>
          {selectedVariant?.availableForSale && (
            <ShopPayButton
              width="100%"
              variantIdsAndQuantities={[
                {
                  id: selectedVariant?.id,
                  quantity,
                },
              ]}
              storeDomain={storeDomain}
              className="-mt-2"
            />
          )}
          <Link
            to={`/products/${product.handle}`}
            prefetch="intent"
            variant="underline"
            className="w-fit"
          >
            View full details →
          </Link>
        </div>
      </div>
    </div>
  );
}

interface QuickShopTriggerProps {
  productHandle: string;
  showOnHover?: boolean;
  buttonType?: "icon" | "text";
  buttonText?: string;
  panelType?: "modal" | "drawer";
}

export function QuickShopTrigger({
  productHandle,
  showOnHover = true,
  buttonType = "icon",
  buttonText = "Quick shop",
  panelType = "modal",
}: QuickShopTriggerProps) {
  const [open, setOpen] = useState(false);
  const { load, data } = useFetcher<{ product: ProductQuery["product"] }>();

  // biome-ignore lint/correctness/useExhaustiveDependencies: open and state are intentionally excluded
  useEffect(() => {
    if (open && !data) {
      load(`/api/product/${productHandle}`);
    }
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          animate={false}
          variant="secondary"
          className={clsx(
            "group/quick-shop absolute bottom-4 h-10.5 p-3 leading-4",
            buttonType === "icon"
              ? "right-4 rounded-full shadow-xl"
              : "inset-x-4 shadow-xs",
            showOnHover &&
              "opacity-0 transition-opacity group-hover:opacity-100",
          )}
        >
          {buttonType === "icon" ? (
            <>
              <HandbagSimpleIcon size={16} className="h-4 w-4" />
              <span className="w-0 overflow-hidden pl-0 text-base transition-all group-hover/quick-shop:w-9.5 group-hover/quick-shop:pl-2">
                Add
              </span>
            </>
          ) : (
            <span className="px-2">{buttonText}</span>
          )}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-10 bg-gray-900/50 data-[state=open]:animate-fade-in" />
        <Dialog.Content
          onCloseAutoFocus={(e) => e.preventDefault()}
          className={clsx(
            "quick-shop-dialog-content",
            "fixed inset-0 z-10 flex items-center overflow-x-hidden",
            "backdrop-blur-xs",
            "[--slide-up-from:20px]",
            "data-[state=open]:animate-slide-up",
            panelType !== "drawer" && "px-4",
          )}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains("quick-shop-dialog-content")) {
              setOpen(false);
            }
          }}
          aria-describedby={undefined}
        >
          <div
            style={{ maxHeight: "90vh" }}
            className={clsx(
              "relative h-auto w-full overflow-hidden",
              "animate-slide-up bg-white shadow-sm",
              panelType === "drawer"
                ? "mr-0 ml-auto min-h-screen max-w-md"
                : "mx-auto max-w-(--breakpoint-xl)",
            )}
          >
            {panelType !== "drawer" && (
              <Dialog.Close asChild>
                <Button
                  className="absolute top-3 right-3 z-20 rounded-full p-2"
                  variant="secondary"
                >
                  <XIcon size={18} />
                </Button>
              </Dialog.Close>
            )}
            <VisuallyHidden.Root asChild>
              <Dialog.Title>Quick shop modal</Dialog.Title>
            </VisuallyHidden.Root>
            {data?.product ? (
              <QuickShop data={data as QuickViewData} panelType={panelType} />
            ) : (
              <div
                className={clsx(
                  "grid grid-cols-1 items-start gap-5",
                  panelType === "modal" ? "lg:grid-cols-2" : "grid-cols-1",
                )}
              >
                <Skeleton className="flex h-183 items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-body-subtle" />
                </Skeleton>
                <div className="flex flex-col justify-start gap-5 py-6 pr-5">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="flex h-10 w-1/2 items-center justify-center">
                    <ShoppingCartIcon className="h-5 w-5 text-body-subtle" />
                  </Skeleton>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
