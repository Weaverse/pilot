import { ShopPayButton } from "@shopify/hydrogen";
import type { ProductVariantComponent } from "@shopify/hydrogen/storefront-api-types";
import {
  createSchema,
  type HydrogenComponentProps,
  type WeaverseProduct,
} from "@weaverse/hydrogen";
import { useState } from "react";
import type { ProductVariantFragment } from "storefront-api.generated";
import Link from "~/components/link";
import { AddToCartButton } from "~/components/product/add-to-cart-button";
import { ProductBadges } from "~/components/product/badges";
import { BundledVariants } from "~/components/product/bundled-variants";
import { Quantity } from "~/components/product/quantity";
import { VariantPrices } from "~/components/product/variant-prices";
import { VariantSelector } from "~/components/product/variant-selector";
import { ProductMedia } from "~/components/product-media";
import { ScrollReveal } from "~/components/scroll-reveal";
import { layoutInputs, Section } from "~/components/section";
import { cn } from "~/utils/cn";
import JudgemeStarsRating from "../main-product/judgeme-stars-rating";
import type { SingleProductLoaderData } from "./loader";
import { SingleProductPlaceholder } from "./placeholder";

export { loader } from "./loader";

export interface SingleProductData {
  productsCount: number;
  product: WeaverseProduct;
  showThumbnails: boolean;
  groupMediaByVariant?: boolean;
  groupByOption?: string;
}

interface SingleProductProps
  extends HydrogenComponentProps<SingleProductLoaderData>,
    SingleProductData {}

export default function SingleProduct(props: SingleProductProps) {
  let {
    loaderData,
    product: _product,
    showThumbnails,
    groupMediaByVariant,
    groupByOption,
    ...rest
  } = props;

  let product = loaderData?.product;
  let variants = loaderData?.variants ?? [];
  let storeDomain = loaderData?.storeDomain;

  let [quantity, setQuantity] = useState<number>(1);
  let [selectedVariant, setSelectedVariant] =
    useState<ProductVariantFragment | null>(
      product?.selectedOrFirstAvailableVariant ?? null,
    );

  if (!product) {
    return <SingleProductPlaceholder {...rest} />;
  }

  let isBundle = Boolean(product?.isBundle?.requiresComponents);
  let bundledVariants = isBundle ? product?.isBundle?.components.nodes : null;
  let atcText = "Add to Cart";
  if (selectedVariant?.availableForSale) {
    atcText = isBundle ? "Add bundle to cart" : "Add to Cart";
  } else if (selectedVariant?.quantityAvailable === -1) {
    atcText = "Unavailable";
  } else {
    atcText = "Sold Out";
  }

  return (
    <Section {...rest}>
      <div>
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-12">
          <div
            className={cn(
              "relative min-w-0",
              showThumbnails && "[--thumbs-width:7rem]",
            )}
          >
            <ProductMedia
              mediaLayout="slider"
              imageAspectRatio="adapt"
              media={product?.media.nodes}
              selectedVariant={selectedVariant}
              showThumbnails={showThumbnails}
              groupMediaByVariant={groupMediaByVariant}
              groupByOption={groupByOption}
              product={product}
            />
            <ProductBadges
              product={product}
              selectedVariant={selectedVariant}
              className="absolute top-4 left-4 z-10"
            />
          </div>
          <ScrollReveal
            animation="slide-in"
            className="flex flex-col justify-start space-y-5"
          >
            <div className="space-y-4">
              <h3 className="tracking-tight">{product?.title}</h3>
              <VariantPrices variant={selectedVariant} />
              <JudgemeStarsRating
                productHandle={product.handle}
                ratingText="{{rating}} ({{total_reviews}} reviews)"
                errorText=""
              />
              <p
                className="line-clamp-5 leading-relaxed"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: product?.summary }}
              />
              {isBundle && (
                <div className="space-y-3">
                  <h4 className="text-2xl">Bundled Products</h4>
                  <BundledVariants
                    variants={bundledVariants as ProductVariantComponent[]}
                  />
                </div>
              )}
              <VariantSelector
                product={product}
                selectedVariant={selectedVariant}
                setSelectedVariant={setSelectedVariant}
                variants={variants}
              />
            </div>
            <Quantity value={quantity} onChange={setQuantity} />
            <AddToCartButton
              disabled={!selectedVariant?.availableForSale}
              lines={[
                {
                  merchandiseId: selectedVariant?.id,
                  quantity,
                  selectedVariant,
                },
              ]}
              variant="primary"
              className="-mt-2"
              data-test="add-to-cart"
            >
              {atcText}
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
          </ScrollReveal>
        </div>
      </div>
    </Section>
  );
}

export const schema = createSchema({
  type: "single-product",
  title: "Single product",
  settings: [
    {
      group: "Layout",
      inputs: layoutInputs,
    },
    {
      group: "Product",
      inputs: [
        {
          label: "Select product",
          type: "product",
          name: "product",
          shouldRevalidate: true,
        },
      ],
    },
    {
      group: "Product Media",
      inputs: [
        {
          label: "Show thumbnails",
          name: "showThumbnails",
          type: "switch",
          defaultValue: false,
        },
        {
          label: "Group media by variant",
          name: "groupMediaByVariant",
          type: "switch",
          defaultValue: false,
          helpText:
            "When enabled, only images matching the selected variant option will be displayed",
        },
        {
          type: "text",
          name: "groupByOption",
          label: "Group by option name",
          defaultValue: "Color",
          placeholder: "Color",
          helpText:
            "The product option name used to group media (e.g., Color, Colour)",
          condition: (data: SingleProductData) =>
            data.groupMediaByVariant === true,
        },
      ],
    },
  ],
});
