import { Money, mapSelectedProductOptionToObject } from "@shopify/hydrogen";
import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";
import { useThemeSettings } from "@weaverse/hydrogen";
import clsx from "clsx";
import { useEffect, useState } from "react";
import type {
  ProductCardFragment,
  ProductVariantFragment,
} from "storefront-api.generated";
import { Image } from "~/components/image";
import { Link } from "~/components/link";
import { NavLink } from "~/components/nav-link";
import { VariantPrices } from "~/components/variant-prices";
import { RevealUnderline } from "~/reveal-underline";
import { getImageAspectRatio } from "~/utils/image";
import { BestSellerBadge, NewBadge, SaleBadge, SoldOutBadge } from "./badges";
import { ProductCardOptions } from "./product-card-options";

const pcardLoadedImages = [];

export function ProductCard({
  product,
  className,
}: {
  product: ProductCardFragment;
  className?: string;
}) {
  const {
    pcardBorderRadius,
    pcardBackgroundColor,
    pcardShowImageOnHover,
    pcardImageRatio,
    pcardTitlePricesAlignment,
    pcardAlignment,
    pcardShowVendor,
    pcardShowLowestPrice,
    pcardShowSalePrice,
    pcardEnableQuickShop,
    pcardQuickShopButtonType,
    pcardQuickShopButtonText,
    pcardQuickShopAction,
    pcardQuickShopPanelType,
    pcardShowSaleBadges,
    pcardShowBestSellerBadges,
    pcardShowNewBadges,
    pcardShowOutOfStockBadges,
  } = useThemeSettings();

  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantFragment | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const { images, badges, priceRange } = product;
  const { minVariantPrice, maxVariantPrice } = priceRange;

  const handleVariantChange = (variant: ProductVariantFragment) => {
    if (
      variant.image &&
      variant.id !== selectedVariant?.id &&
      !pcardLoadedImages.includes(variant.image.url)
    ) {
      setIsImageLoading(true);
    }
    setSelectedVariant(variant);
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
    pcardLoadedImages.push(selectedVariant.image.url);
  };

  // Reset loading state if variant doesn't have an image
  useEffect(() => {
    if (selectedVariant && !selectedVariant.image) {
      setIsImageLoading(false);
    }
  }, [selectedVariant]);

  const firstVariant = product.selectedOrFirstAvailableVariant;
  const params = new URLSearchParams(
    mapSelectedProductOptionToObject(
      (selectedVariant || firstVariant)?.selectedOptions || [],
    ),
  );

  const isVertical = pcardTitlePricesAlignment === "vertical";
  const isBestSellerProduct = badges
    .filter(Boolean)
    .some(({ key, value }) => key === "best_seller" && value === "true");

  let [image, secondImage] = images.nodes;
  if (selectedVariant) {
    if (selectedVariant.image) {
      image = selectedVariant.image;
      const imageUrl = image.url;
      const imageIndex = images.nodes.findIndex(({ url }) => url === imageUrl);
      if (imageIndex > 0 && imageIndex < images.nodes.length - 1) {
        secondImage = images.nodes[imageIndex + 1];
      }
    }
  }

  return (
    <div
      className={clsx("rounded-(--pcard-radius)", className)}
      style={
        {
          backgroundColor: pcardBackgroundColor,
          "--pcard-radius": `${pcardBorderRadius}px`,
          "--pcard-image-ratio": getImageAspectRatio(image, pcardImageRatio),
        } as React.CSSProperties
      }
    >
      <div className="relative group">
        {image && (
          <Link
            to={`/products/${product.handle}?${params.toString()}`}
            prefetch="intent"
            className="overflow-hidden rounded-t-(--pcard-radius) block group relative aspect-(--pcard-image-ratio) bg-gray-100"
          >
            {/* Loading skeleton overlay */}
            {isImageLoading && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              </div>
            )}
            <Image
              className={clsx([
                "absolute inset-0",
                pcardShowImageOnHover &&
                  secondImage &&
                  "transition-opacity duration-300 group-hover:opacity-50",
              ])}
              sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
              data={image}
              width={700}
              alt={image.altText || `Picture of ${product.title}`}
              loading="lazy"
              onLoad={handleImageLoad}
            />
            {pcardShowImageOnHover && secondImage && (
              <Image
                className={clsx([
                  "absolute inset-0",
                  "transition-opacity duration-300 opacity-0 group-hover:opacity-100",
                ])}
                sizes="auto"
                width={700}
                data={secondImage}
                alt={
                  secondImage.altText || `Second picture of ${product.title}`
                }
                loading="lazy"
              />
            )}
          </Link>
        )}
        <div className="flex gap-1 absolute top-2.5 right-2.5">
          {pcardShowSaleBadges && (
            <SaleBadge
              price={minVariantPrice as MoneyV2}
              compareAtPrice={maxVariantPrice as MoneyV2}
            />
          )}
          {pcardShowBestSellerBadges && isBestSellerProduct && (
            <BestSellerBadge />
          )}
          {pcardShowNewBadges && <NewBadge publishedAt={product.publishedAt} />}
          {pcardShowOutOfStockBadges && <SoldOutBadge />}
        </div>
        {/* <QuickShopTrigger productHandle={product.handle} /> */}
      </div>
      <div
        className={clsx(
          "py-3 text-sm space-y-2",
          pcardBackgroundColor && "px-2",
          isVertical && [
            pcardAlignment === "left" && "text-left",
            pcardAlignment === "center" && "text-center",
            pcardAlignment === "right" && "text-right",
          ],
        )}
      >
        {pcardShowVendor && (
          <div className="uppercase text-body-subtle">{product.vendor}</div>
        )}
        <div
          className={clsx(
            "flex",
            isVertical
              ? [
                  "flex-col gap-1",
                  [
                    pcardAlignment === "left" && "items-start",
                    pcardAlignment === "center" && "items-center",
                    pcardAlignment === "right" && "items-end",
                  ],
                ]
              : "justify-between gap-4",
          )}
        >
          <NavLink
            to={`/products/${product.handle}?${params.toString()}`}
            prefetch="intent"
            className={({ isTransitioning }) =>
              clsx(
                "font-bold ",
                isTransitioning && "[view-transition-name:product-image]",
              )
            }
          >
            <RevealUnderline>{product.title}</RevealUnderline>
          </NavLink>
          {pcardShowLowestPrice ? (
            <div className="flex gap-1">
              <span>From</span>
              <Money withoutTrailingZeros data={minVariantPrice} />
            </div>
          ) : (
            <VariantPrices
              variant={selectedVariant || firstVariant}
              showCompareAtPrice={pcardShowSalePrice}
            />
          )}
        </div>
        <ProductCardOptions
          product={product}
          selectedVariant={selectedVariant}
          setSelectedVariant={handleVariantChange}
          className={clsx(
            isVertical && [
              pcardAlignment === "left" && "justify-start",
              pcardAlignment === "center" && "justify-center",
              pcardAlignment === "right" && "justify-end",
            ],
          )}
        />
      </div>
    </div>
  );
}
