import { Money } from "@shopify/hydrogen";
import type { MediaImage } from "@shopify/hydrogen/storefront-api-types";
import { IMAGES_PLACEHOLDERS } from "@weaverse/hydrogen";
import clsx from "clsx";
import type { CSSProperties } from "react";
import type { ProductQuery } from "storefront-api.generated";
import { Image } from "~/components/image";
import { Link } from "~/components/link";
import type { HotspotsItemData } from "./item";

interface ProductPopupProps
  extends Omit<HotspotsItemData, "icon" | "iconSize" | "product"> {
  product: ProductQuery["product"];
}

const PRODUCT_PLACEHOLDER: Partial<ProductQuery["product"]> = {
  id: "gid://shopify/Product/123",
  title: "Example Product Title",
  handle: "#",
  media: {
    nodes: [
      {
        id: "1",
        __typename: "MediaImage",
        mediaContentType: "IMAGE",
        image: {
          id: "1",
          url: IMAGES_PLACEHOLDERS.product_4,
          width: 500,
          height: 500,
        },
      },
    ],
  },
  priceRange: {
    minVariantPrice: {
      amount: "99.0",
      currencyCode: "USD",
    },
    maxVariantPrice: {
      amount: "129.0",
      currencyCode: "USD",
    },
  },
};

export function ProductPopup({
  // @ts-expect-error
  product = PRODUCT_PLACEHOLDER,
  popupWidth,
  offsetX,
  offsetY,
  showPrice,
  showViewDetailsLink,
  viewDetailsLinkText,
}: ProductPopupProps) {
  if (!product) {
    return null;
  }

  const featuredMedia = product.media.nodes.find(
    (node) => node.__typename === "MediaImage",
  ) as MediaImage;
  const featuredImage = featuredMedia?.image;
  const price = product.priceRange?.minVariantPrice;
  const compareAtPrice = product.priceRange?.maxVariantPrice;

  return (
    <div
      className={clsx(
        "absolute z-10 py-1.5 text-sm transition-all sm:text-base",
        "invisible opacity-0",
        "w-40 sm:w-(--popup-width)",
        "translate-x-[calc(var(--translate-x-ratio)*var(--spot-size))]",
        "translate-y-[calc(var(--translate-y-ratio)*-16px)]",
        "group-hover:visible group-hover:opacity-100",
        "group-hover:translate-x-[calc(var(--translate-x-ratio)*var(--spot-size))]",
        "group-hover:translate-y-0",
      )}
      style={
        {
          "--translate-x-ratio": offsetX > 50 ? 1 : -1,
          "--translate-y-ratio": offsetY > 50 ? 1 : -1,
          "--popup-width": `${popupWidth}px`,
          top: offsetY > 50 ? "auto" : "100%",
          bottom: offsetY > 50 ? "100%" : "auto",
          left: offsetX > 50 ? "auto" : "100%",
          right: offsetX > 50 ? "100%" : "auto",
        } as CSSProperties
      }
    >
      <div className="flex flex-col gap-3 bg-white p-2.5 shadow-lg sm:flex-row">
        {featuredImage && (
          <div className="h-auto w-full sm:w-28">
            <Image data={featuredImage} alt={product.title} sizes="auto" />
          </div>
        )}
        <div className="flex flex-col gap-2 py-2">
          <div className="space-y-1">
            <div className="font-semibold">{product.title}</div>
            {showPrice && (
              <div className="flex items-center gap-1.5">
                {compareAtPrice && (
                  <Money
                    withoutTrailingZeros
                    data={compareAtPrice}
                    as="div"
                    className="font-medium text-base text-gray-400 line-through"
                  />
                )}
                {price && (
                  <Money
                    withoutTrailingZeros
                    data={price}
                    as="div"
                    className="font-medium text-base"
                  />
                )}
              </div>
            )}
          </div>
          {showViewDetailsLink && (
            <Link
              to={`/products/${product.handle}`}
              variant="underline"
              className="w-fit text-sm"
            >
              {viewDetailsLinkText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
