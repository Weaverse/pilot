import { useLoaderData, useSearchParams } from "@remix-run/react";
import {
  Money,
  ShopPayButton,
  useOptimisticVariant,
  useSelectedOptionInUrlParam,
} from "@shopify/hydrogen";
import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";
import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef, useState } from "react";
import { CompareAtPrice } from "~/components/compare-at-price";
import { Link } from "~/components/link";
import { AddToCartButton } from "~/components/product/add-to-cart-button";
import {
  ProductMedia,
  type ProductMediaProps,
} from "~/components/product/product-media";
import { Quantity } from "~/components/product/quantity";
import { ProductVariants } from "~/components/product/variants";
import { Section, type SectionProps, layoutInputs } from "~/components/section";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";
import { isDiscounted, isNewArrival } from "~/utils/product";
import { ProductDetails } from "./product-details";

interface ProductInformationProps
  extends SectionProps,
    Omit<ProductMediaProps, "selectedVariant" | "media"> {
  addToCartText: string;
  soldOutText: string;
  unavailableText: string;
  selectVariantText: string;
  showVendor: boolean;
  showSalePrice: boolean;
  showShortDescription: boolean;
  showShippingPolicy: boolean;
  showRefundPolicy: boolean;
  hideUnavailableOptions: boolean;
}

let ProductInformation = forwardRef<HTMLDivElement, ProductInformationProps>(
  (props, ref) => {
    let { product, variants, storeDomain } =
      useLoaderData<typeof productRouteLoader>();
    let [params] = useSearchParams();
    let selectedVariant = useOptimisticVariant(
      product.selectedVariant,
      variants,
    );

    let {
      addToCartText,
      soldOutText,
      unavailableText,
      selectVariantText,
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

    if (product) {
      let { title, handle, vendor, summary, options, priceRange } = product;
      let allOptionNames = options.map((option) => option.name);
      let isAllOptionsSelected = allOptionNames.every((name) =>
        params.get(name),
      );

      let atcText = isAllOptionsSelected
        ? selectedVariant
          ? selectedVariant.availableForSale
            ? addToCartText
            : soldOutText
          : unavailableText
        : selectVariantText;

      let discountedAmount = 0;

      // let discountedAmount =
      //   (selectedVariant?.compareAtPrice?.amount || 0) /
      //     selectedVariant?.price?.amount -
      //   1;
      let isNew = isNewArrival(product.publishedAt);

      return (
        <Section ref={ref} {...rest} overflow="unset">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-body-subtle hover:underline underline-offset-4"
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
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-sm">
                    {discountedAmount > 0 && discountedAmount < 1 && (
                      <span className="py-1.5 px-2 text-background bg-[--color-discount] rounded">
                        -{Math.round(discountedAmount * 100)}%
                      </span>
                    )}
                    {isNew && (
                      <span className="py-1.5 px-2 text-background bg-[--color-new-badge] rounded">
                        NEW ARRIVAL
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {showVendor && vendor && (
                      <span className="text-body-subtle">{vendor}</span>
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
                        selectedVariant.compareAtPrice as MoneyV2,
                      ) &&
                        showSalePrice && (
                          <CompareAtPrice
                            data={selectedVariant.compareAtPrice as MoneyV2}
                            className="text-2xl/none"
                          />
                        )}
                    </div>
                  ) : (
                    <Money
                      withoutTrailingZeros
                      data={priceRange.minVariantPrice}
                      as="div"
                      className="font-medium text-2xl/none"
                    />
                  )}
                  {children}
                  {showShortDescription && (
                    <p className="leading-relaxed">{summary}</p>
                  )}
                  <ProductVariants
                    variants={variants}
                    options={options}
                    productHandle={handle}
                    hideUnavailableOptions={hideUnavailableOptions}
                  />
                </div>
                <Quantity value={quantity} onChange={setQuantity} />
                <div className="space-y-2">
                  <AddToCartButton
                    disabled={!selectedVariant?.availableForSale}
                    lines={[
                      {
                        merchandiseId: selectedVariant?.id,
                        quantity,
                        selectedVariant,
                      },
                    ]}
                    data-test="add-to-cart"
                    className="w-full uppercase"
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
                <ProductDetails
                  showShippingPolicy={showShippingPolicy}
                  showRefundPolicy={showRefundPolicy}
                />
              </div>
            </div>
          </div>
        </Section>
      );
    }
    return (
      <div ref={ref} {...rest}>
        No product data...
      </div>
    );
  },
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
          type: "text",
          label: "Select variant text",
          name: "selectVariantText",
          defaultValue: "Select variant",
          placeholder: "Select variant",
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
