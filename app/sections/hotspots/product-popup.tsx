import { Image, Money } from "@shopify/hydrogen";
import type { MediaImage } from "@shopify/hydrogen/storefront-api-types";
import { IMAGES_PLACEHOLDERS } from "@weaverse/hydrogen";
import clsx from "clsx";
import type { CSSProperties } from "react";
import type { ProductQuery } from "storefrontapi.generated";
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
  variants: {
    nodes: [
      {
        id: "1",
        availableForSale: true,
        quantityAvailable: 0,
        selectedOptions: [],
        price: {
          amount: "99.0",
          currencyCode: "USD",
        },
        compareAtPrice: {
          amount: "129.0",
          currencyCode: "USD",
        },
        title: "Default Title",
        unitPrice: null,
        product: {
          title: "Example Product",
          handle: "#",
        },
      },
    ],
  },
};

export function ProductPopup({
  // @ts-ignore
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

  let featuredMedia = product.media.nodes.find(
    (node) => node.__typename === "MediaImage",
  ) as MediaImage;
  let featuredImage = featuredMedia?.image;
  let price = product.variants.nodes[0].price;
  let compareAtPrice = product.variants.nodes[0].compareAtPrice;

  return (
    <div
      className={clsx(
        "absolute z-10 py-1.5 text-sm sm:text-base transition-all",
        "invisible opacity-0",
        "w-40 sm:w-[var(--popup-width)]",
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
      <div className="p-2.5 bg-white shadow-lg flex flex-col sm:flex-row gap-3">
        {featuredImage && (
          <div className="w-full sm:w-28 h-auto">
            <Image data={featuredImage} alt={product.title} sizes="auto" />
          </div>
        )}
        <div className="flex flex-col gap-2 py-2 font-sans">
          <div className="space-y-1">
            <div className="font-semibold">{product.title}</div>
            {showPrice && (
              <div className="flex items-center gap-1.5">
                {compareAtPrice && (
                  <Money
                    withoutTrailingZeros
                    data={compareAtPrice}
                    as="div"
                    className="text-base font-medium line-through text-gray-400"
                  />
                )}
                <Money
                  withoutTrailingZeros
                  data={price}
                  as="div"
                  className="text-base font-medium"
                />
              </div>
            )}
          </div>
          {showViewDetailsLink && (
            <Link
              to={`/products/${product.handle}`}
              className="underline-offset-4 underline text-sm"
            >
              {viewDetailsLinkText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
