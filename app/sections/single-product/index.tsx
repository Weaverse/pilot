import {
  getAdjacentAndFirstAvailableVariants,
  getProductOptions,
  Money,
  ShopPayButton,
  useOptimisticVariant,
} from "@shopify/hydrogen";
import {
  type ComponentLoaderArgs,
  createSchema,
  type HydrogenComponentProps,
  type WeaverseProduct,
} from "@weaverse/hydrogen";
import { forwardRef, useState } from "react";
import type { ProductQuery } from "storefront-api.generated";
import { AddToCartButton } from "~/components/product/add-to-cart-button";
import { ProductMedia } from "~/components/product/product-media";
import { Quantity } from "~/components/product/quantity";
import { ProductVariants } from "~/components/product/variants";
import { layoutInputs, Section } from "~/components/section";
import { PRODUCT_QUERY } from "~/graphql/queries";
import { useAnimation } from "~/hooks/use-animation";
import { ProductPlaceholder } from "./product-placeholder";

interface SingleProductData {
  productsCount: number;
  product: WeaverseProduct;
  hideUnavailableOptions: boolean;
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
      hideUnavailableOptions,
      showThumbnails,
      ...rest
    } = props;
    const { storeDomain, product } = loaderData || {};
    const [quantity, setQuantity] = useState<number>(1);
    const [scope] = useAnimation(ref);

    // Optimistically selects a variant with given available variant information
    const selectedVariant = useOptimisticVariant(
      product?.selectedOrFirstAvailableVariant,
      product ? getAdjacentAndFirstAvailableVariants(product) : [],
    );

    if (!product) {
      return (
        <Section ref={ref} {...rest}>
          <ProductPlaceholder />
        </Section>
      );
    }

    // Get the product options array
    const productOptions = getProductOptions({
      ...product,
      selectedOrFirstAvailableVariant: selectedVariant,
    });

    if (!product)
      return (
        <section
          className="w-full py-12 md:py-24 lg:py-32"
          ref={scope}
          {...rest}
        >
          <ProductPlaceholder />
        </section>
      );

    const atcText = selectedVariant?.availableForSale
      ? "Add to Cart"
      : selectedVariant?.quantityAvailable === -1
        ? "Unavailable"
        : "Sold Out";

    return (
      <Section ref={ref} {...rest}>
        <div ref={scope}>
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-12 fade-up">
            <ProductMedia
              mediaLayout="slider"
              imageAspectRatio="adapt"
              media={product?.media.nodes}
              selectedVariant={selectedVariant}
              showThumbnails={showThumbnails}
            />
            <div
              className="flex flex-col justify-start space-y-5"
              data-motion="slide-in"
            >
              <div className="space-y-4">
                <h3 data-motion="fade-up">{product?.title}</h3>
                <p className="text-lg" data-motion="fade-up">
                  {selectedVariant ? (
                    <Money
                      withoutTrailingZeros
                      data={selectedVariant.price}
                      as="span"
                    />
                  ) : null}
                </p>
                {children}
                <p
                  className="leading-relaxed fade-up line-clamp-5"
                  suppressHydrationWarning
                  dangerouslySetInnerHTML={{
                    __html: product?.summary,
                  }}
                />
                <ProductVariants productOptions={productOptions} />
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
                className="w-full"
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
                />
              )}
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
        {
          label: "Hide unavailable options",
          type: "switch",
          name: "hideUnavailableOptions",
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
          defaultValue: true,
        },
      ],
    },
  ],
});

export default SingleProduct;
