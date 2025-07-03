import { getProductOptions, Money, ShopPayButton } from "@shopify/hydrogen";
import type { MoneyV2 } from "@shopify/hydrogen/customer-account-api-types";
import {
  type ComponentLoaderArgs,
  createSchema,
  type HydrogenComponentProps,
  IMAGES_PLACEHOLDERS,
  type WeaverseProduct,
} from "@weaverse/hydrogen";
import { forwardRef, useState } from "react";
import type {
  ProductQuery,
  ProductVariantFragment,
} from "storefront-api.generated";
import { Button } from "~/components/button";
import { Image } from "~/components/image";
import Link from "~/components/link";
import { AddToCartButton } from "~/components/product/add-to-cart-button";
import {
  BestSellerBadge,
  NewBadge,
  SaleBadge,
  SoldOutBadge,
} from "~/components/product/badges";
import { ProductMedia } from "~/components/product/product-media";
import { Quantity } from "~/components/product/quantity";
import { layoutInputs, Section } from "~/components/section";
import { PRODUCT_QUERY } from "~/graphql/queries";
import { useAnimation } from "~/hooks/use-animation";
import { hasOnlyDefaultVariant } from "~/utils/product";
import { SingleProductVariantSelector } from "./variant-selector";

interface SingleProductData {
  productsCount: number;
  product: WeaverseProduct;
  showThumbnails: boolean;
}

type SingleProductProps = HydrogenComponentProps<
  Awaited<ReturnType<typeof loader>>
> &
  SingleProductData;

const SingleProduct = forwardRef<HTMLElement, SingleProductProps>(
  (props, ref) => {
    const {
      loaderData,
      children,
      product: _product,
      showThumbnails,
      ...rest
    } = props;
    const { storeDomain, product } = loaderData || {};
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedVariant, setSelectedVariant] =
      useState<ProductVariantFragment | null>(null);
    const [scope] = useAnimation(ref);

    // Use the selected variant or fall back to the first available variant
    const currentVariant =
      selectedVariant || product?.selectedOrFirstAvailableVariant;

    if (!product) {
      return (
        <Section ref={ref} {...rest}>
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <Image
                data={{
                  url: IMAGES_PLACEHOLDERS.product_2,
                  width: 1660,
                  height: 1660,
                }}
                loading="lazy"
                width={1660}
                aspectRatio="1/1"
                sizes="auto"
              />
              <div className="flex flex-col items-start justify-start gap-4">
                <SoldOutBadge />
                <h3 data-motion="fade-up" className="tracking-tight">
                  EXAMPLE PRODUCT TITLE
                </h3>
                <Money
                  withoutTrailingZeros
                  data={{ amount: "19.99", currencyCode: "USD" }}
                  as="span"
                  className="text-lg"
                />
                <p className="text-body-subtle">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <Button
                  type="button"
                  className="w-full cursor-not-allowed"
                  disabled
                >
                  SOLD OUT
                </Button>
                <Link
                  to="#"
                  prefetch="intent"
                  variant="underline"
                  className="w-fit cursor-not-allowed"
                  onClick={(e) => e.preventDefault()}
                >
                  View full details →
                </Link>
              </div>
            </div>
          </div>
        </Section>
      );
    }

    // Get the product options array
    const productOptions = getProductOptions({
      ...product,
      selectedOrFirstAvailableVariant: currentVariant,
    });

    const atcText = currentVariant?.availableForSale
      ? "Add to Cart"
      : currentVariant?.quantityAvailable === -1
        ? "Unavailable"
        : "Sold Out";
    const isBestSellerProduct = product.badges
      .filter(Boolean)
      .some(({ key, value }) => key === "best_seller" && value === "true");

    return (
      <Section ref={ref} {...rest}>
        <div ref={scope}>
          <div className="fade-up grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-12">
            <ProductMedia
              mediaLayout="slider"
              imageAspectRatio="adapt"
              media={product?.media.nodes}
              selectedVariant={currentVariant}
              showThumbnails={showThumbnails}
            />
            <div
              className="flex flex-col justify-start space-y-5"
              data-motion="slide-in"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm empty:hidden">
                  {currentVariant?.availableForSale ? (
                    <>
                      {currentVariant && (
                        <SaleBadge
                          price={currentVariant.price as MoneyV2}
                          compareAtPrice={
                            currentVariant.compareAtPrice as MoneyV2
                          }
                        />
                      )}
                      <NewBadge publishedAt={product.publishedAt} />
                      {isBestSellerProduct && <BestSellerBadge />}
                    </>
                  ) : (
                    <SoldOutBadge />
                  )}
                </div>
                <h3 data-motion="fade-up" className="tracking-tight">
                  {product?.title}
                </h3>
                <p className="text-lg" data-motion="fade-up">
                  {currentVariant ? (
                    <Money
                      withoutTrailingZeros
                      data={currentVariant.price}
                      as="span"
                    />
                  ) : null}
                </p>
                {children}
                <p
                  className="fade-up line-clamp-5 leading-relaxed"
                  suppressHydrationWarning
                  dangerouslySetInnerHTML={{ __html: product?.summary }}
                />
                {!hasOnlyDefaultVariant(productOptions) ? (
                  <div className="space-y-5" data-motion="fade-up">
                    <div className="product-form space-y-5">
                      {productOptions.map((option) => (
                        <div
                          className="product-options space-y-2"
                          key={option.name}
                        >
                          <legend className="leading-tight">
                            <span className="font-bold">{option.name}</span>
                          </legend>
                          <SingleProductVariantSelector
                            option={option}
                            selectedVariant={selectedVariant}
                            onVariantChange={setSelectedVariant}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              <Quantity value={quantity} onChange={setQuantity} />
              <AddToCartButton
                disabled={!currentVariant?.availableForSale}
                lines={[
                  {
                    merchandiseId: currentVariant?.id,
                    quantity,
                    selectedVariant: currentVariant,
                  },
                ]}
                variant="primary"
                className="-mt-2 w-full"
                data-test="add-to-cart"
              >
                {atcText}
              </AddToCartButton>
              {currentVariant?.availableForSale && (
                <ShopPayButton
                  width="100%"
                  variantIdsAndQuantities={[
                    {
                      id: currentVariant?.id,
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
            </div>
          </div>
        </div>
      </Section>
    );
  },
);

export const loader = async (args: ComponentLoaderArgs<SingleProductData>) => {
  const { weaverse, data } = args;
  const { storefront } = weaverse;
  if (!data.product) {
    return null;
  }
  const productHandle = data.product.handle;
  const { product, shop } = await storefront.query<ProductQuery>(
    PRODUCT_QUERY,
    {
      variables: {
        handle: productHandle,
        selectedOptions: [],
        language: storefront.i18n.language,
        country: storefront.i18n.country,
      },
    },
  );

  return {
    product,
    storeDomain: shop.primaryDomain.url,
  };
};

export const schema = createSchema({
  type: "single-product",
  title: "Single product",
  childTypes: ["judgeme"],
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
      ],
    },
  ],
});

export default SingleProduct;
