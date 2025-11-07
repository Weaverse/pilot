import { Money, mapSelectedProductOptionToObject } from "@shopify/hydrogen";
import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";
import { useThemeSettings } from "@weaverse/hydrogen";
import clsx from "clsx";
import { useState } from "react";
import { useViewTransitionState } from "react-router";
import type {
  ProductCardFragment,
  ProductVariantFragment,
} from "storefront-api.generated";
import { Image } from "~/components/image";
import { Link } from "~/components/link";
import { RevealUnderline } from "~/components/reveal-underline";
import { Spinner } from "~/components/spinner";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import JudgemeStarsRating from "~/sections/main-product/judgeme-stars-rating";
import { isCombinedListing } from "~/utils/combined-listings";
import { calculateAspectRatio } from "~/utils/image";
import {
  BestSellerBadge,
  BundleBadge,
  NewBadge,
  SaleBadge,
  SoldOutBadge,
} from "./badges";
import { ProductCardOptions } from "./product-card-options";
import { QuickShopTrigger } from "./quick-shop";
import { VariantPrices } from "./variant-prices";

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
    pcardShowReviews,
    pcardShowLowestPrice,
    pcardShowSalePrice,
    pcardEnableQuickShop,
    pcardShowQuickShopOnHover,
    pcardQuickShopButtonType,
    pcardQuickShopButtonText,
    pcardQuickShopPanelType,
    pcardShowSaleBadge,
    pcardShowBundleBadge,
    pcardShowBestSellerBadge,
    pcardShowNewBadge,
    pcardShowOutOfStockBadge,
  } = useThemeSettings();

  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantFragment | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const productPageHref = usePrefixPathWithLocale(
    `/products/${product.handle}`,
  );
  const isTransitioning = useViewTransitionState(productPageHref);

  const { images, badges, priceRange } = product;
  const { minVariantPrice, maxVariantPrice } = priceRange;

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
  const isBundle = Boolean(product?.isBundle?.requiresComponents);

  let [image, secondImage] = images.nodes;
  if (selectedVariant?.image) {
    image = selectedVariant.image;
    const imageUrl = image.url;
    const imageIndex = images.nodes.findIndex(({ url }) => url === imageUrl);
    if (imageIndex > 0 && imageIndex < images.nodes.length - 1) {
      secondImage = images.nodes[imageIndex + 1];
    }
  }

  return (
    <div
      className={clsx("rounded-(--pcard-radius)", className)}
      style={
        {
          backgroundColor: pcardBackgroundColor,
          "--pcard-radius": `${pcardBorderRadius}px`,
          "--pcard-image-ratio": calculateAspectRatio(image, pcardImageRatio),
        } as React.CSSProperties
      }
    >
      <div className="group relative">
        {image && (
          <Link
            to={`/products/${product.handle}?${params.toString()}`}
            prefetch="intent"
            className="group relative block aspect-(--pcard-image-ratio) overflow-hidden rounded-t-(--pcard-radius) bg-gray-100"
          >
            {/* Loading skeleton overlay */}
            {isImageLoading && <Spinner className="bg-gray-100" />}
            <Image
              className={clsx([
                "absolute inset-0",
                pcardShowImageOnHover &&
                  secondImage &&
                  "transition-opacity duration-300 group-hover:opacity-50",
                isTransitioning &&
                  "[&_img]:[view-transition-name:image-expand]",
              ])}
              sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
              data={image}
              width={700}
              alt={image.altText || `Picture of ${product.title}`}
              loading="lazy"
              onLoad={() => setIsImageLoading(false)}
            />
            {pcardShowImageOnHover && secondImage && (
              <Image
                className={clsx([
                  "absolute inset-0",
                  "opacity-0 transition-opacity duration-300 group-hover:opacity-100",
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
        <div className="absolute top-2.5 right-2.5 flex gap-1">
          {isBundle && pcardShowBundleBadge && <BundleBadge />}
          {pcardShowSaleBadge && (
            <SaleBadge
              price={minVariantPrice as MoneyV2}
              compareAtPrice={maxVariantPrice as MoneyV2}
            />
          )}
          {pcardShowBestSellerBadge && isBestSellerProduct && (
            <BestSellerBadge />
          )}
          {pcardShowNewBadge && <NewBadge publishedAt={product.publishedAt} />}
          {pcardShowOutOfStockBadge && <SoldOutBadge />}
        </div>
        {pcardEnableQuickShop && (
          <QuickShopTrigger
            productHandle={product.handle}
            showOnHover={pcardShowQuickShopOnHover}
            buttonType={pcardQuickShopButtonType}
            buttonText={pcardQuickShopButtonText}
            panelType={pcardQuickShopPanelType}
          />
        )}
      </div>
      <div
        className={clsx(
          "space-y-2 py-3 text-sm",
          pcardBackgroundColor && "px-2",
          isVertical && [
            pcardAlignment === "left" && "text-left",
            pcardAlignment === "center" && "text-center",
            pcardAlignment === "right" && "text-right",
          ],
        )}
      >
        {pcardShowVendor && (
          <div className="text-body-subtle uppercase">{product.vendor}</div>
        )}
        {pcardShowReviews && (
          <JudgemeStarsRating
            productHandle={product.handle}
            ratingText="{{rating}} ({{total_reviews}} reviews)"
            errorText=""
          />
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
          <Link
            to={`/products/${product.handle}?${params.toString()}`}
            prefetch="intent"
            className="inline-block font-bold"
          >
            <RevealUnderline className="bg-position-[left_calc(1em+3px)] leading-normal">
              {product.title}
            </RevealUnderline>
          </Link>
          {pcardShowLowestPrice || isCombinedListing(product) ? (
            <div className="flex gap-1">
              <span>From</span>
              <Money withoutTrailingZeros data={minVariantPrice} />
              {isCombinedListing(product) && (
                <>
                  <span>–</span>
                  <Money withoutTrailingZeros data={maxVariantPrice} />
                </>
              )}
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
          setSelectedVariant={(variant: ProductVariantFragment) => {
            // Only show loading if variant has a different image
            if (variant.image?.url !== selectedVariant?.image?.url) {
              setIsImageLoading(true);
            }
            setSelectedVariant(variant);
          }}
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
