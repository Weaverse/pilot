import { ImageIcon, ShoppingCartIcon } from "@phosphor-icons/react";
import { ShopPayButton } from "@shopify/hydrogen";
import type { ProductVariantComponent } from "@shopify/hydrogen/storefront-api-types";
import {
  createSchema,
  type HydrogenComponentProps,
  type WeaverseProduct,
} from "@weaverse/hydrogen";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import type {
  ProductQuery,
  ProductVariantFragment,
} from "storefront-api.generated";
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
import { Skeleton } from "~/components/skeleton";
import JudgemeStarsRating from "../main-product/judgeme-stars-rating";

interface SingleProductData {
  productsCount: number;
  product: WeaverseProduct;
  showThumbnails: boolean;
  groupMediaByVariant?: boolean;
  groupByOption?: string;
}

interface FetchedProductData {
  product: NonNullable<ProductQuery["product"]> | null;
  variants: ProductVariantFragment[];
  storeDomain: string | null;
}

type SingleProductProps = HydrogenComponentProps &
  SingleProductData & {
    ref: React.Ref<HTMLElement>;
  };

export default function SingleProduct(props: SingleProductProps) {
  const {
    ref: weaverseRef,
    product: _product,
    showThumbnails,
    groupMediaByVariant,
    groupByOption,
    ...rest
  } = props;

  const productHandle = _product?.handle;
  const { ref: inViewRef, inView } = useInView({ triggerOnce: true });
  const [fetchedData, setFetchedData] = useState<FetchedProductData | null>(
    null,
  );
  const [quantity, setQuantity] = useState<number>(1);

  const product = fetchedData?.product;
  const variants = fetchedData?.variants ?? [];
  const storeDomain = fetchedData?.storeDomain;

  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantFragment | null>(null);

  // Fetch product data when section scrolls into view
  useEffect(() => {
    if (inView && productHandle && !fetchedData) {
      fetch(`/api/product/${productHandle}`)
        .then((res) => res.json())
        .then((data: FetchedProductData) => {
          setFetchedData(data);
          if (data.product?.selectedOrFirstAvailableVariant) {
            setSelectedVariant(data.product.selectedOrFirstAvailableVariant);
          }
        })
        .catch(console.error);
    }
  }, [inView, productHandle, fetchedData]);

  // Combine refs: inViewRef for intersection observer + weaverseRef for Weaverse Studio
  const setRefs = (node: HTMLElement) => {
    inViewRef(node);
    if (typeof weaverseRef === "function") {
      weaverseRef(node);
    } else if (weaverseRef && "current" in weaverseRef) {
      (weaverseRef as React.RefObject<HTMLElement | null>).current = node;
    }
  };

  if (!product) {
    return (
      <Section ref={setRefs} {...rest}>
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-12">
          <Skeleton className="flex aspect-square items-center justify-center">
            <ImageIcon className="h-16 w-16 text-body-subtle" />
          </Skeleton>
          <div className="flex flex-col justify-start gap-5">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-14" />
              <Skeleton className="h-10 w-14" />
              <Skeleton className="h-10 w-14" />
            </div>
            <Skeleton className="flex h-12 w-full items-center justify-center">
              <ShoppingCartIcon className="h-5 w-5 text-body-subtle" />
            </Skeleton>
          </div>
        </div>
      </Section>
    );
  }

  const isBundle = Boolean(product?.isBundle?.requiresComponents);
  const bundledVariants = isBundle ? product?.isBundle?.components.nodes : null;
  let atcText = "Add to Cart";
  if (selectedVariant?.availableForSale) {
    atcText = isBundle ? "Add bundle to cart" : "Add to Cart";
  } else if (selectedVariant?.quantityAvailable === -1) {
    atcText = "Unavailable";
  } else {
    atcText = "Sold Out";
  }

  return (
    <Section ref={setRefs} {...rest}>
      <div>
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="relative min-w-0">
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
              className="-mt-2 w-full"
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
