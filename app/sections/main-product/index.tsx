import { createSchema } from "@weaverse/hydrogen";
import clsx from "clsx";
import { useLoaderData } from "react-router";
import {
  ProductMedia,
  type ProductMediaProps,
} from "~/components/product/product-media";
import { layoutInputs, Section, type SectionProps } from "~/components/section";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { isCombinedListing } from "~/utils/combined-listings";

interface ProductInformationData
  extends Omit<ProductMediaProps, "selectedVariant" | "media"> {
  ref: React.Ref<HTMLDivElement>;
}

export default function ProductInformation(
  props: ProductInformationData & SectionProps,
) {
  const {
    ref,
    mediaLayout,
    gridSize,
    imageAspectRatio,
    showThumbnails,
    children,
    enableZoom,
    zoomTrigger,
    zoomButtonVisibility,
    ...rest
  } = props;
  const { product } = useLoaderData<typeof productRouteLoader>();

  const combinedListing = isCombinedListing(product);

  if (product) {
    const { handle } = product;

    return (
      <Section ref={ref} {...rest} overflow="unset">
        <div
          className={clsx([
            "space-y-5 lg:grid lg:space-y-0",
            "lg:gap-[clamp(30px,5%,60px)]",
            "lg:grid-cols-[1fr_clamp(360px,45%,480px)]",
          ])}
        >
          <ProductMedia
            key={handle}
            mediaLayout={mediaLayout}
            gridSize={gridSize}
            imageAspectRatio={imageAspectRatio}
            media={
              combinedListing && product?.featuredImage
                ? [
                    {
                      __typename: "MediaImage",
                      id: product.featuredImage.id,
                      mediaContentType: "IMAGE",
                      alt: product.featuredImage.altText,
                      previewImage: product.featuredImage,
                      image: product.featuredImage,
                    },
                    ...(product?.media?.nodes || []),
                  ]
                : product?.media?.nodes || []
            }
            selectedVariant={product?.selectedOrFirstAvailableVariant}
            showThumbnails={showThumbnails}
            enableZoom={enableZoom}
            zoomTrigger={zoomTrigger}
            zoomButtonVisibility={zoomButtonVisibility}
          />
          <div>
            <div
              className="sticky flex flex-col justify-start gap-5"
              style={{ top: "calc(var(--height-nav) + 20px)" }}
            >
              {children}
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
}

export const schema = createSchema({
  type: "main-product",
  title: "Main product",
  childTypes: [
    "mp--breadcrumb",
    "mp--badges",
    "mp--vendor",
    "mp--title",
    "mp--prices",
    "judgeme-stars-rating",
    "mp--summary",
    "mp--bundled-variants",
    "mp--variant-selector",
    "mp--quantity-selector",
    "mp--atc-buttons",
    "mp--collapsible-details",
  ],
  limit: 1,
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [
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
          condition: (data: ProductInformationData) =>
            data.mediaLayout === "grid",
        },
        {
          label: "Show thumbnails",
          name: "showThumbnails",
          type: "switch",
          defaultValue: true,
          condition: (data: ProductInformationData) =>
            data.mediaLayout === "slider",
        },
        {
          label: "Enable zoom",
          name: "enableZoom",
          type: "switch",
          defaultValue: true,
        },
        {
          type: "select",
          name: "zoomTrigger",
          label: "Zoom trigger",
          defaultValue: "both",
          configs: {
            options: [
              { value: "image", label: "Click on image" },
              { value: "button", label: "Click on zoom button" },
              { value: "both", label: "Both" },
            ],
          },
          condition: (data: ProductInformationData) => data.enableZoom === true,
        },
        {
          type: "select",
          name: "zoomButtonVisibility",
          label: "When to show zoom button",
          defaultValue: "hover",
          configs: {
            options: [
              { value: "always", label: "Always" },
              { value: "hover", label: "On hover" },
            ],
          },
          condition: (data: ProductInformationData) =>
            data.enableZoom === true &&
            (data.zoomTrigger === "button" || data.zoomTrigger === "both"),
        },
      ],
    },
  ],
  presets: {
    mediaLayout: "grid",
    gridSize: "2x2",
    children: [
      {
        type: "mp--breadcrumb",
        homeText: "Home",
      },
      {
        type: "mp--badges",
      },
      {
        type: "mp--vendor",
      },
      {
        type: "mp--title",
        headingTag: "h1",
      },
      {
        type: "mp--prices",
        showCompareAtPrice: true,
      },
      {
        type: "judgeme-stars-rating",
      },
      {
        type: "mp--summary",
      },
      {
        type: "mp--bundled-variants",
        headingText: "Bundled Products",
        headingClassName: "text-2xl",
      },
      {
        type: "mp--variant-selector",
      },
      {
        type: "mp--quantity-selector",
      },
      {
        type: "mp--atc-buttons",
        addToCartText: "Add to cart",
        addBundleToCartText: "Add bundle to cart",
        soldOutText: "Sold out",
        showShopPayButton: true,
        buttonClassName: "w-full uppercase",
      },
      {
        type: "mp--collapsible-details",
        showShippingPolicy: true,
        showRefundPolicy: true,
      },
    ],
  },
});
