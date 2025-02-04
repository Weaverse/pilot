import {
  flattenConnection,
  mapSelectedProductOptionToObject,
  Money,
  VariantSelector,
} from "@shopify/hydrogen";
import type {
  MoneyV2,
  ProductVariant,
} from "@shopify/hydrogen/storefront-api-types";
import { useThemeSettings } from "@weaverse/hydrogen";
import clsx from "clsx";
import type { ProductCardFragment } from "storefront-api.generated";
import { Image } from "~/components/image";
import { Link } from "~/components/link";
import { NavLink } from "~/components/nav-link";
import { VariantPrices } from "~/components/variant-prices";
import { getImageAspectRatio } from "~/utils/image";
import { BestSellerBadge, NewBadge, SaleBadge, SoldOutBadge } from "./badges";
import { cva } from "class-variance-authority";
import { VariantOption } from "./variant-option";

let styleVariants = cva("", {
  variants: {
    alignment: {
      left: "",
      center: "text-center [&_.title-and-price]:items-center",
      right: "text-right [&_.title-and-price]:items-end",
    },
  },
});

export function ProductCard({
  product,
  className,
}: {
  product: ProductCardFragment;
  className?: string;
}) {
  let {
    pcardBorderRadius,
    pcardBackgroundColor,
    pcardShowImageOnHover,
    pcardImageRatio,
    pcardTitlePricesAlignment,
    pcardAlignment,
    pcardShowVendor,
    pcardShowLowestPrice,
    pcardShowSalePrice,
    pcardShowOptionSwatches,
    pcardOptionToShow,
    pcardMaxOptionValues,
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

  let { images, badges, priceRange, options } = product;
  let variants = flattenConnection(product.variants);
  let selectedVariant = variants[0];
  let [image, secondImage] = images.nodes;
  let { minVariantPrice, maxVariantPrice } = priceRange;
  let isVertical = pcardTitlePricesAlignment === "vertical";
  let isBestSellerProduct = badges
    .filter(Boolean)
    .some(({ key, value }) => key === "best_seller" && value === "true");

  let firstVariant = variants[0];
  let optionsObject = mapSelectedProductOptionToObject(
    firstVariant.selectedOptions,
  );
  let firstVariantParams = new URLSearchParams(optionsObject);

  return (
    <div
      className={clsx("overflow-hidden", className)}
      style={
        {
          borderRadius: pcardBorderRadius,
          backgroundColor: pcardBackgroundColor,
          "--pcard-image-ratio": getImageAspectRatio(image, pcardImageRatio),
        } as React.CSSProperties
      }
    >
      <div className="relative group">
        {image && (
          <Link
            to={`/products/${product.handle}?${firstVariantParams.toString()}`}
            prefetch="intent"
            className="block group relative aspect-[--pcard-image-ratio] overflow-hidden bg-gray-100"
          >
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
          isVertical && styleVariants({ alignment: pcardAlignment }),
        )}
      >
        {pcardShowVendor && (
          <div className="uppercase text-body-subtle">{product.vendor}</div>
        )}
        <div
          className={clsx(
            "flex",
            isVertical
              ? "title-and-price flex-col gap-1"
              : "justify-between gap-4",
          )}
        >
          <NavLink
            to={`/products/${product.handle}`}
            prefetch="intent"
            className={({ isTransitioning }) =>
              clsx("font-bold ", isTransitioning && "vt-product-image")
            }
          >
            {product.title}
          </NavLink>
          {pcardShowLowestPrice ? (
            <div className="flex gap-1">
              <span>From</span>
              <Money withoutTrailingZeros data={minVariantPrice} />
            </div>
          ) : (
            <VariantPrices
              variant={selectedVariant as ProductVariant}
              showCompareAtPrice={pcardShowSalePrice}
            />
          )}
        </div>
        {/* {pcardShowOptionSwatches && (
          <div className="flex flex-wrap gap-2">
            {options.map((option) => {
              if (option.name === pcardOptionToShow) {
                return (
                  <VariantOption
                    key={option.id}
                    name={option.name}
                    values={option.optionValues.slice(0, pcardMaxOptionValues)}
                    selectedOptionValue=""
                    onSelectOptionValue={console.log}
                  />
                );
              }
              return null;
            })}
          </div>
        )} */}
      </div>
    </div>
  );
}
