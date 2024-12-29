import { flattenConnection } from "@shopify/hydrogen";
import type {
  MoneyV2,
  ProductVariant,
} from "@shopify/hydrogen/storefront-api-types";
import { useThemeSettings } from "@weaverse/hydrogen";
import clsx from "clsx";
import type { ProductCardFragment } from "storefront-api.generated";
import { Link } from "~/components/link";
import { NavLink } from "~/components/nav-link";
import { Image } from "~/components/primitives/image";
import { VariantPrices } from "~/components/variant-prices";
import { getImageAspectRatio } from "~/utils/image";
import { BestSellerBadge, NewBadge, SaleBadge, SoldOutBadge } from "./badges";

export function ProductCard({
  product,
  className,
}: {
  product: ProductCardFragment;
  className?: string;
}) {
  let {
    pcardAlignment,
    pcardBorderRadius,
    pcardBackgroundColor,
    pcardShowImageOnHover,
    pcardImageRatio,
    pcardShowVendor,
    pcardShowLowestPrice,
    pcardShowSku,
    pcardShowSalePrice,
    pcardShowOptionSwatches,
    pcardOptionToShow,
    pcardMaxOptions,
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

  let variants = flattenConnection(product.variants);
  let { images, badges } = product;
  let [image, secondImage] = images.nodes;
  let selectedVariant = variants[0];
  let isBestSellerProduct = badges
    .filter(Boolean)
    .some(({ key, value }) => key === "best_seller" && value === "true");
  if (!selectedVariant) return null;

  let { price, compareAtPrice } = selectedVariant;

  return (
    <div
      className="overflow-hidden"
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
            to={`/products/${product.handle}`}
            prefetch="intent"
            className="block group relative aspect-[--pcard-image-ratio] overflow-hidden bg-gray-100"
          >
            <Image
              className={clsx([
                "absolute inset-0",
                pcardShowImageOnHover &&
                  secondImage &&
                  "transition-opacity duration-300 group-hover:opacity-0",
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
              price={price as MoneyV2}
              compareAtPrice={compareAtPrice as MoneyV2}
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
        className="flex flex-col py-3"
        style={{ alignItems: pcardAlignment }}
      >
        {pcardShowVendor && (
          <div className="text-sm uppercase text-body-subtle mb-2">
            {product.vendor}
          </div>
        )}
        <div className="flex items-center gap-2 mb-1">
          <NavLink
            to={`/products/${product.handle}`}
            prefetch="intent"
            className={({ isTransitioning }) =>
              clsx("font-bold", isTransitioning && "vt-product-image")
            }
          >
            <span>{product.title}</span>
          </NavLink>
          {pcardShowSku && selectedVariant.sku && (
            <span className="text-body-subtle">({selectedVariant.sku})</span>
          )}
        </div>
        <VariantPrices
          variant={selectedVariant as ProductVariant}
          showCompareAtPrice={pcardShowSalePrice}
          className="mb-2"
        />
        {/* {pcardShowOptionSwatches && <div>options here</div>} */}
      </div>
    </div>
  );
}
