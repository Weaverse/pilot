import { useLoaderData, useSearchParams } from "@remix-run/react";
import { Money, ShopPayButton, useOptimisticVariant } from "@shopify/hydrogen";
import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";
import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import clsx from "clsx";
import { forwardRef, useState } from "react";
import { CompareAtPrice } from "~/components/compare-at-price";
import { Link } from "~/components/link";
import { AddToCartButton } from "~/components/product/add-to-cart-button";
import {
  BestSellerBadge,
  NewBadge,
  SaleBadge,
} from "~/components/product/badges";
import {
  ProductMedia,
  type ProductMediaProps,
} from "~/components/product/product-media";
import { Quantity } from "~/components/product/quantity";
import { ProductVariants } from "~/components/product/variants";
import { Section, type SectionProps, layoutInputs } from "~/components/section";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";
import { isDiscounted } from "~/utils/product";
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
      enableZoom,
      ...rest
    } = props;
    let [quantity, setQuantity] = useState<number>(1);

    if (product) {
      let {
        title,
        handle,
        vendor,
        summary,
        options,
        priceRange,
        publishedAt,
        badges,
      } = product;
      let allOptionNames = options.map(({ name }) => name);
      let isAllOptionsSelected = allOptionNames.every((name) =>
        params.get(name),
      );
      let isBestSellerProduct = badges
        .filter(Boolean)
        .some(({ key, value }) => key === "best_seller" && value === "true");

      return (
        <Section ref={ref} {...rest} overflow="unset">
          <div
            className={clsx([
              "space-y-5 lg:space-y-0 lg:grid",
              "lg:gap-[clamp(30px,5%,60px)]",
              "lg:grid-cols-[1fr_clamp(360px,45%,480px)]",
            ])}
          >
            <ProductMedia
              key={handle}
              mediaLayout={mediaLayout}
              gridSize={gridSize}
              imageAspectRatio={imageAspectRatio}
              media={product?.media.nodes}
              selectedVariant={selectedVariant}
              showThumbnails={showThumbnails}
              enableZoom={enableZoom}
            />
            <div>
              <div
                className="sticky flex flex-col justify-start space-y-5"
                style={{ top: "calc(var(--height-nav) + 20px)" }}
              >
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/"
                    className="text-body-subtle hover:underline underline-offset-4"
                  >
                    Home
                  </Link>
                  <span className="inline-block h-4 border-r border-body-subtle" />
                  <span>{product.title}</span>
                </div>
                <div className="flex items-center gap-2 text-sm empty:hidden">
                  {selectedVariant && (
                    <SaleBadge
                      price={selectedVariant.price as MoneyV2}
                      compareAtPrice={selectedVariant.compareAtPrice as MoneyV2}
                    />
                  )}
                  <NewBadge publishedAt={publishedAt} />
                  {isBestSellerProduct && <BestSellerBadge />}
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
                    {isAllOptionsSelected
                      ? selectedVariant
                        ? selectedVariant.availableForSale
                          ? addToCartText
                          : soldOutText
                        : unavailableText
                      : selectVariantText}
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
            ],
          },
        },
        {
          type: "toggle-group",
          name: "mediaLayout",
          label: "Layout",
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
          label: "Enable zoom",
          name: "enableZoom",
          type: "switch",
          defaultValue: true,
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
