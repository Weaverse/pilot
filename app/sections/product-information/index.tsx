import { useLoaderData, useSearchParams } from "@remix-run/react";
import { Money, ShopPayButton, useOptimisticVariant } from "@shopify/hydrogen";
import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";
import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef, useEffect, useState } from "react";
import { CompareAtPrice } from "~/components/compare-at-price";
import { Link } from "~/components/link";
import { Section, type SectionProps, layoutInputs } from "~/components/section";
import { getExcerpt, isDiscounted, isNewArrival } from "~/lib/utils";
import { AddToCartButton } from "~/modules/add-to-cart-button";
import {
  ProductMedia,
  type ProductMediaProps,
} from "~/modules/product-form/product-media";
import { Quantity } from "~/modules/product-form/quantity";
import { ProductVariants } from "~/modules/product-form/variants";
import type { loader as productLoader } from "~/routes/($locale).products.$productHandle";
import { ProductDetail } from "./product-detail";

interface ProductInformationProps
  extends SectionProps,
    Omit<ProductMediaProps, "selectedVariant" | "media"> {
  addToCartText: string;
  soldOutText: string;
  unavailableText: string;
  showVendor: boolean;
  showSalePrice: boolean;
  showShortDescription: boolean;
  showShippingPolicy: boolean;
  showRefundPolicy: boolean;
  hideUnavailableOptions: boolean;
}

let ProductInformation = forwardRef<HTMLDivElement, ProductInformationProps>(
  (props, ref) => {
    let {
      product,
      shop,
      variants: _variants,
      storeDomain,
    } = useLoaderData<typeof productLoader>();
    let variants = _variants?.product?.variants;
    let selectedVariantOptimistic = useOptimisticVariant(
      product?.selectedVariant || variants?.nodes?.[0],
      variants
    );
    let [selectedVariant, setSelectedVariant] = useState<any>(
      selectedVariantOptimistic
    );

    let {
      addToCartText,
      soldOutText,
      unavailableText,
      showVendor,
      showSalePrice,
      showShortDescription,
      showShippingPolicy,
      showRefundPolicy,
      hideUnavailableOptions,
      mediaLayout,
      gridSize,
      imageAspectRatio,
      showThumbnails,
      children,
      ...rest
    } = props;
    let [quantity, setQuantity] = useState<number>(1);
    let [searchParams] = useSearchParams();

    let atcText = selectedVariant?.availableForSale
      ? addToCartText
      : selectedVariant?.quantityAvailable === -1
      ? unavailableText
      : soldOutText;

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
      if (!selectedVariant && variants?.nodes?.[0]) {
        setSelectedVariant(variants?.nodes?.[0]);
      } else if (
        selectedVariantOptimistic?.id &&
        selectedVariantOptimistic.id !== selectedVariant?.id
      ) {
        setSelectedVariant(selectedVariantOptimistic);
      }
    }, [selectedVariantOptimistic?.id]);

    function handleSelectedVariantChange(variant: any) {
      setSelectedVariant(variant);
      if (!variant?.selectedOptions) return;
      // update the url
      for (let option of variant.selectedOptions) {
        searchParams.set(option.name, option.value);
      }
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${searchParams.toString()}`
      );
    }

    if (product && variants) {
      let { title, vendor, summary, description } = product;
      let { shippingPolicy, refundPolicy } = shop;
      let discountedAmount =
        (selectedVariant?.compareAtPrice?.amount || 0) /
          selectedVariant?.price?.amount -
        1;
      let isNew = isNewArrival(product.publishedAt);

      return (
        <Section ref={ref} {...rest} overflow="unset">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-body/50 hover:underline underline-offset-4"
            >
              Home
            </Link>
            <span>/</span>
            <span>{product.title}</span>
          </div>
          <div className="space-y-5 lg:space-y-0 lg:grid lg:gap-[clamp(30px,5%,60px)] lg:grid-cols-[1fr_clamp(360px,45%,480px)]">
            <ProductMedia
              mediaLayout={mediaLayout}
              gridSize={gridSize}
              imageAspectRatio={imageAspectRatio}
              media={product?.media.nodes}
              selectedVariant={selectedVariant}
              showThumbnails={showThumbnails}
            />
            <div>
              <div
                className="sticky flex flex-col justify-start space-y-5"
                style={{ top: "calc(var(--height-nav) + 20px)" }}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    {discountedAmount > 0 && discountedAmount < 1 && (
                      <span className="py-1.5 px-2 text-background bg-[var(--color-sale-tag)] rounded">
                        -{Math.round(discountedAmount * 100)}%
                      </span>
                    )}
                    {isNew && (
                      <span className="py-1.5 px-2 text-background bg-[var(--color-new-tag)] rounded">
                        NEW ARRIVAL
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {showVendor && vendor && (
                      <span className="text-body/50">{vendor}</span>
                    )}
                    <h1 className="h3 !tracking-tight">{title}</h1>
                  </div>
                  {selectedVariant ? (
                    <div className="flex items-center gap-2">
                      <Money
                        withoutTrailingZeros
                        data={selectedVariant.price}
                        as="span"
                        className="font-medium text-2xl/none"
                      />
                      {isDiscounted(
                        selectedVariant.price as MoneyV2,
                        selectedVariant.compareAtPrice as MoneyV2
                      ) &&
                        showSalePrice && (
                          <CompareAtPrice
                            data={selectedVariant.compareAtPrice as MoneyV2}
                            className="text-2xl/none"
                          />
                        )}
                    </div>
                  ) : null}
                  {children}
                  {showShortDescription && (
                    <p className="leading-relaxed">{summary}</p>
                  )}
                  <ProductVariants
                    product={product}
                    selectedVariant={selectedVariant}
                    onSelectedVariantChange={handleSelectedVariantChange}
                    variants={variants}
                    options={product?.options}
                    handle={product?.handle}
                    hideUnavailableOptions={hideUnavailableOptions}
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
                  data-test="add-to-cart"
                  className="w-full hover:border-black"
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
                <div className="grid py-4">
                  <ProductDetail title="Description" content={description} />
                  {showShippingPolicy && shippingPolicy?.body && (
                    <ProductDetail
                      title="Shipping"
                      content={getExcerpt(shippingPolicy.body)}
                      learnMore={`/policies/${shippingPolicy.handle}`}
                    />
                  )}
                  {showRefundPolicy && refundPolicy?.body && (
                    <ProductDetail
                      title="Returns"
                      content={getExcerpt(refundPolicy.body)}
                      learnMore={`/policies/${refundPolicy.handle}`}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </Section>
      );
    }
    return <div ref={ref} {...rest} />;
  }
);

export default ProductInformation;

export let schema: HydrogenComponentSchema = {
  type: "product-information",
  title: "Main product",
  childTypes: ["judgeme"],
  limit: 1,
  enabledOn: {
    pages: ["PRODUCT"],
  },
  inspector: [
    { group: "Layout", inputs: layoutInputs },
    {
      group: "Product Media",
      inputs: [
        {
          type: "toggle-group",
          name: "mediaLayout",
          label: "Media layout",
          configs: {
            options: [
              {
                label: "Grid",
                value: "grid",
                icon: "grid-2x2",
              },
              {
                label: "Slider",
                value: "slider",
                icon: "slideshow-outline",
              },
            ],
          },
          defaultValue: "grid",
        },
        {
          type: "select",
          name: "gridSize",
          label: "Grid size",
          defaultValue: "2x2",
          configs: {
            options: [
              { label: "1x1", value: "1x1" },
              { label: "2x2", value: "2x2" },
              { label: "Mix", value: "mix" },
            ],
          },
          condition: "mediaLayout.eq.grid",
        },
        {
          label: "Show thumbnails",
          name: "showThumbnails",
          type: "switch",
          defaultValue: true,
          condition: "mediaLayout.eq.slider",
        },
        {
          type: "select",
          name: "imageAspectRatio",
          label: "Aspect ratio",
          defaultValue: "adapt",
          configs: {
            options: [
              { value: "adapt", label: "Adapt to image" },
              { value: "1/1", label: "Square (1/1)" },
              { value: "3/4", label: "Portrait (3/4)" },
              { value: "4/3", label: "Landscape (4/3)" },
              { value: "16/9", label: "Widescreen (16/9)" },
            ],
          },
        },
      ],
    },
    {
      group: "Product information",
      inputs: [
        {
          type: "text",
          label: "Add to cart text",
          name: "addToCartText",
          defaultValue: "Add to cart",
          placeholder: "Add to cart",
        },
        {
          type: "text",
          label: "Sold out text",
          name: "soldOutText",
          defaultValue: "Sold out",
          placeholder: "Sold out",
        },
        {
          type: "text",
          label: "Unavailable text",
          name: "unavailableText",
          defaultValue: "Unavailable",
          placeholder: "Unavailable",
        },
        {
          type: "switch",
          label: "Show vendor",
          name: "showVendor",
          defaultValue: false,
        },
        {
          type: "switch",
          label: "Show sale price",
          name: "showSalePrice",
          defaultValue: true,
        },
        {
          type: "switch",
          label: "Show short description",
          name: "showShortDescription",
          defaultValue: true,
        },
        {
          type: "switch",
          label: "Show shipping policy",
          name: "showShippingPolicy",
          defaultValue: true,
        },
        {
          type: "switch",
          label: "Show refund policy",
          name: "showRefundPolicy",
          defaultValue: true,
        },
        {
          label: "Hide unavailable options",
          type: "switch",
          name: "hideUnavailableOptions",
          defaultValue: false,
        },
      ],
    },
  ],
  presets: {
    width: "stretch",
    mediaLayout: "grid",
    gridSize: "2x2",
  },
};
