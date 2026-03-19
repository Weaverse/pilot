import type { VariantProps } from "class-variance-authority";
import type {
  MediaFragment,
  ProductQuery,
  ProductVariantFragment,
} from "storefront-api.generated";
import type { ImageAspectRatio } from "~/types/others";
import { MediaGrid, type mediaGridVariants } from "./media-grid";
import { MediaSlider } from "./media-slider";
import { getVariantGroupedMedia } from "./variant-media-group";

export interface ProductMediaProps
  extends VariantProps<typeof mediaGridVariants> {
  mediaLayout: "grid" | "slider";
  imageAspectRatio?: ImageAspectRatio;
  showThumbnails: boolean;
  selectedVariant: ProductVariantFragment;
  media: MediaFragment[];
  enableZoom?: boolean;
  zoomTrigger?: "image" | "button" | "both";
  zoomButtonVisibility?: "always" | "hover";
  groupMediaByVariant?: boolean;
  groupByOption?: string;
  product?: NonNullable<ProductQuery["product"]>;
  initialMediaCount?: number;
  showMoreText?: string;
  showLessText?: string;
}

export function ProductMedia(props: ProductMediaProps) {
  const {
    mediaLayout: initialMediaLayout,
    gridSize: initialGridSize,
    showThumbnails,
    imageAspectRatio,
    selectedVariant,
    media,
    enableZoom,
    zoomTrigger = "button",
    zoomButtonVisibility = "hover",
    groupMediaByVariant,
    groupByOption,
    product,
    initialMediaCount = 0,
    showMoreText = "Show more",
    showLessText = "Show less",
  } = props;

  let displayMedia = media;
  let isMediaGrouped = false;
  if (groupMediaByVariant && product && groupByOption) {
    let result = getVariantGroupedMedia({
      allMedia: media,
      selectedVariant,
      product,
      groupByOption,
    });
    displayMedia = result.media;
    isMediaGrouped = result.isGrouped;
  }

  let mediaLayout = initialMediaLayout;
  let gridSize = initialGridSize;
  if (displayMedia.length === 1) {
    mediaLayout = "grid";
    gridSize = "1x1";
  }

  if (mediaLayout === "grid") {
    return (
      <MediaGrid
        allMedia={media}
        displayMedia={displayMedia}
        gridSize={gridSize}
        imageAspectRatio={imageAspectRatio}
        enableZoom={enableZoom}
        zoomTrigger={zoomTrigger}
        zoomButtonVisibility={zoomButtonVisibility}
        selectedVariant={selectedVariant}
        initialMediaCount={initialMediaCount}
        showMoreText={showMoreText}
        showLessText={showLessText}
      />
    );
  }

  return (
    <MediaSlider
      allMedia={media}
      displayMedia={displayMedia}
      selectedVariant={selectedVariant}
      showThumbnails={showThumbnails}
      imageAspectRatio={imageAspectRatio}
      enableZoom={enableZoom}
      zoomTrigger={zoomTrigger}
      zoomButtonVisibility={zoomButtonVisibility}
      groupMediaByVariant={isMediaGrouped}
    />
  );
}
