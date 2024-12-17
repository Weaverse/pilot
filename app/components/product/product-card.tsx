import { Image, flattenConnection } from "@shopify/hydrogen";
import type {
  MoneyV2,
  ProductVariant,
} from "@shopify/hydrogen/storefront-api-types";
import clsx from "clsx";
import type { ProductCardFragment } from "storefrontapi.generated";
import { Link } from "~/components/link";
import { NavLink } from "~/components/nav-link";
import { ProductTag } from "~/components/product-tag";
import { VariantPrices } from "~/components/variant-prices";
import { isDiscounted, isNewArrival } from "~/lib/utils";
import { QuickShopTrigger } from "./quick-shop";

export function ProductCard({
  product,
  className,
  loading,
}: {
  product: ProductCardFragment;
  className?: string;
  loading?: HTMLImageElement["loading"];
}) {
  if (!product?.variants?.nodes?.length) return null;

  let variants = flattenConnection(product.variants);
  let firstVariant = variants[0];

  if (!firstVariant) return null;

  let { image, price, compareAtPrice } = firstVariant;
  let cardLabel = "";
  if (isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2)) {
    cardLabel = "Sale";
  } else if (isNewArrival(product.publishedAt)) {
    cardLabel = "New arrival";
  }

  return (
    <div className="flex flex-col gap-2">
      <div className={clsx("grid gap-4", className)}>
        <div className="relative group">
          {image && (
            <Link
              to={`/products/${product.handle}`}
              prefetch="intent"
              className="block"
            >
              <Image
                className="w-full h-full opacity-0 animate-fade-in"
                sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
                data={image}
                alt={image.altText || `Picture of ${product.title}`}
                loading={loading}
              />
            </Link>
          )}
          {cardLabel && (
            <ProductTag className="absolute top-2.5 right-2.5 bg-background text-body uppercase">
              {cardLabel}
            </ProductTag>
          )}
          <QuickShopTrigger productHandle={product.handle} />
        </div>
        <div className="flex flex-col gap-1">
          <NavLink
            to={`/products/${product.handle}`}
            prefetch="intent"
            className={({ isTransitioning }) => {
              return isTransitioning ? "vt-product-image" : "";
            }}
          >
            <span>{product.title}</span>
            {firstVariant.sku && <span>({firstVariant.sku})</span>}
          </NavLink>
          <VariantPrices variant={firstVariant as ProductVariant} />
        </div>
      </div>
    </div>
  );
}
