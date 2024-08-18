import type { ShopifyAnalyticsProduct } from "@shopify/hydrogen";
import { Image, Money, flattenConnection } from "@shopify/hydrogen";
import type { MoneyV2, Product } from "@shopify/hydrogen/storefront-api-types";
import clsx from "clsx";
import type { ProductCardFragment } from "storefrontapi.generated";
import { getProductPlaceholder } from "~/lib/placeholders";
import { isDiscounted, isNewArrival } from "~/lib/utils";
import { Button } from "~/modules/button";
import { Text } from "~/modules/text";
import { Link } from "~/components/link";
import { QuickViewTrigger } from "./quick-view";
import { CompareAtPrice } from "~/components/compare-at-price";
import { AddToCartButton } from "./add-to-cart-button";

export function ProductCard({
  product,
  label,
  className,
  loading,
  onClick,
  quickAdd,
}: {
  product: ProductCardFragment;
  label?: string;
  className?: string;
  loading?: HTMLImageElement["loading"];
  onClick?: () => void;
  quickAdd?: boolean;
}) {
  let cardLabel = "";
  let cardProduct: Product = product?.variants
    ? (product as Product)
    : getProductPlaceholder();
  if (!cardProduct?.variants?.nodes?.length) return null;

  let variants = flattenConnection(cardProduct.variants);
  let firstVariant = variants[0];

  if (!firstVariant) return null;
  let { image, price, compareAtPrice } = firstVariant;

  if (label) {
    cardLabel = label;
  } else if (isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2)) {
    cardLabel = "Sale";
  } else if (isNewArrival(product.publishedAt)) {
    cardLabel = "New";
  }

  let productAnalytics: ShopifyAnalyticsProduct = {
    productGid: product.id,
    variantGid: firstVariant.id,
    name: product.title,
    variantName: firstVariant.title,
    brand: product.vendor,
    price: firstVariant.price.amount,
    quantity: 1,
  };

  return (
    <div className="flex flex-col gap-2">
      <div className={clsx("grid gap-4", className)}>
        <div className="relative aspect-[4/5] bg-background/5 group">
          {image && (
            <Link
              onClick={onClick}
              to={`/products/${product.handle}`}
              prefetch="intent"
            >
              <Image
                className="object-cover w-full opacity-0 animate-fade-in"
                sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
                aspectRatio="4/5"
                data={image}
                alt={image.altText || `Picture of ${product.title}`}
                loading={loading}
              />
            </Link>
          )}
          <Text
            as="label"
            size="fine"
            className="absolute top-0 right-0 m-4 text-right text-notice"
          >
            {cardLabel}
          </Text>
          {quickAdd && variants.length > 1 && (
            <QuickViewTrigger productHandle={product.handle} />
          )}
          {quickAdd &&
            variants.length === 1 &&
            firstVariant.availableForSale && (
              <div className="absolute bottom-0 hidden w-full bg-[rgba(238,239,234,0.10)] px-3 py-5 opacity-100 backdrop-blur-2xl lg:group-hover:block">
                <AddToCartButton
                  lines={[
                    {
                      quantity: 1,
                      merchandiseId: firstVariant.id,
                      selectedVariant: firstVariant,
                    },
                  ]}
                  variant="secondary"
                  className="mt-2"
                  analytics={{
                    products: [productAnalytics],
                    totalValue: Number.parseFloat(productAnalytics.price),
                  }}
                >
                  Add to Cart
                </AddToCartButton>
              </div>
            )}
        </div>
        <div className="grid gap-1">
          <Text
            className="w-full overflow-hidden whitespace-nowrap text-ellipsis space-x-1 text-lg"
            as="p"
          >
            <Link
              onClick={onClick}
              to={`/products/${product.handle}`}
              prefetch="intent"
              className={({ isTransitioning }) => {
                return isTransitioning ? "vt-product-image" : "";
              }}
            >
              <span>{product.title}</span>
              {firstVariant.sku && <span>({firstVariant.sku})</span>}
            </Link>
          </Text>
          <div className="flex">
            <Text className="flex gap-2">
              <Money withoutTrailingZeros data={price} />
              {isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2) && (
                <CompareAtPrice data={compareAtPrice as MoneyV2} />
              )}
            </Text>
          </div>
        </div>
      </div>
      {quickAdd && firstVariant.availableForSale && (
        <AddToCartButton
          lines={[
            {
              quantity: 1,
              merchandiseId: firstVariant.id,
              selectedVariant: firstVariant,
            },
          ]}
          variant="secondary"
          className="mt-2 lg:hidden"
          analytics={{
            products: [productAnalytics],
            totalValue: Number.parseFloat(productAnalytics.price),
          }}
        >
          Add to Cart
        </AddToCartButton>
      )}
      {quickAdd && !firstVariant.availableForSale && (
        <Button variant="secondary" className="mt-2 lg:hidden" disabled>
          <Text as="span" className="flex items-center justify-center gap-2 ">
            Sold out
          </Text>
        </Button>
      )}
    </div>
  );
}
