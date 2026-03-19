import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import {
  ProductMedia,
  type ProductMediaProps,
} from "~/components/product-media";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { cn } from "~/utils/cn";
import { isCombinedListing } from "~/utils/combined-listings";

interface ProductMediaComponentProps
  extends Omit<ProductMediaProps, "selectedVariant" | "media" | "product">,
    HydrogenComponentProps {
  ref: React.Ref<HTMLDivElement>;
}

export default function ProductMediaComponent(
  props: ProductMediaComponentProps,
) {
  const {
    ref,
    children,
    mediaLayout,
    gridSize,
    imageAspectRatio,
    showThumbnails,
    enableZoom,
    zoomTrigger,
    zoomButtonVisibility,
    groupMediaByVariant,
    groupByOption,
    initialMediaCount,
    showMoreText,
    showLessText,
    ...rest
  } = props;
  const { product } = useLoaderData<typeof productRouteLoader>();

  const selectedVariant = product?.selectedOrFirstAvailableVariant;

  if (!product) {
    return null;
  }

  const combinedListing = isCombinedListing(product);
  const media =
    combinedListing && product?.featuredImage
      ? [
          {
            __typename: "MediaImage" as const,
            id: product.featuredImage.id,
            mediaContentType: "IMAGE" as const,
            alt: product.featuredImage.altText,
            previewImage: product.featuredImage,
            image: product.featuredImage,
          },
          ...(product?.media?.nodes || []),
        ]
      : product?.media?.nodes || [];

  return (
    <div
      ref={ref}
      {...rest}
      className={cn(
        "relative min-w-0",
        mediaLayout === "slider" &&
          showThumbnails &&
          "[--thumbs-width:7rem] @min-[1600px]/main-product:[--thumbs-width:8rem]",
      )}
    >
      <ProductMedia
        key={product.handle}
        mediaLayout={mediaLayout}
        gridSize={gridSize}
        imageAspectRatio={imageAspectRatio}
        media={media}
        selectedVariant={selectedVariant}
        showThumbnails={showThumbnails}
        enableZoom={enableZoom}
        zoomTrigger={zoomTrigger}
        zoomButtonVisibility={zoomButtonVisibility}
        groupMediaByVariant={groupMediaByVariant}
        groupByOption={groupByOption}
        product={product}
        initialMediaCount={initialMediaCount}
        showMoreText={showMoreText}
        showLessText={showLessText}
      />
      {children}
    </div>
  );
}

export const schema = createSchema({
  type: "mp--media",
  title: "Product Media",
  limit: 1,
  childTypes: ["mp--badges"],
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [
    {
      group: "Product Media",
      inputs: [
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
          condition: (data: ProductMediaComponentProps) =>
            data.mediaLayout === "grid",
        },
        {
          label: "Show thumbnails",
          name: "showThumbnails",
          type: "switch",
          defaultValue: true,
          condition: (data: ProductMediaComponentProps) =>
            data.mediaLayout === "slider",
        },
        {
          type: "select",
          name: "imageAspectRatio",
          label: "Image aspect ratio",
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
          type: "heading",
          label: "Media group",
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
          condition: (data: ProductMediaComponentProps) =>
            data.groupMediaByVariant === true,
        },
        {
          type: "heading",
          label: "Zoom settings",
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
          condition: (data: ProductMediaComponentProps) =>
            data.enableZoom === true,
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
          condition: (data: ProductMediaComponentProps) =>
            data.enableZoom === true &&
            (data.zoomTrigger === "button" || data.zoomTrigger === "both"),
        },
        {
          type: "heading",
          label: "Additional settings for grid layout",
          condition: (data: ProductMediaComponentProps) =>
            data.mediaLayout === "grid",
        },
        {
          type: "range",
          name: "initialMediaCount",
          label: "Initial media to show",
          defaultValue: 4,
          configs: {
            min: 0,
            max: 20,
            step: 1,
          },
          helpText:
            "Number of media items visible before 'Show more'. Set to 0 to show all.",
          condition: (data: ProductMediaComponentProps) =>
            data.mediaLayout === "grid",
        },
        {
          type: "text",
          name: "showMoreText",
          label: "Show more button text",
          defaultValue: "Show more",
          placeholder: "Show more",
          condition: (data: ProductMediaComponentProps) =>
            data.mediaLayout === "grid" && (data.initialMediaCount ?? 0) > 0,
        },
        {
          type: "text",
          name: "showLessText",
          label: "Show less button text",
          defaultValue: "Show less",
          placeholder: "Show less",
          condition: (data: ProductMediaComponentProps) =>
            data.mediaLayout === "grid" && (data.initialMediaCount ?? 0) > 0,
        },
      ],
    },
  ],
  presets: {
    mediaLayout: "grid",
    gridSize: "2x2",
    children: [
      {
        type: "mp--badges",
      },
    ],
  },
});
