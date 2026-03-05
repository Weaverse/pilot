import { cva } from "class-variance-authority";
import type {
  MediaFragment,
  ProductVariantFragment,
} from "storefront-api.generated";

export const mediaGridVariants = cva(
  [
    "grid w-full justify-start gap-2 lg:gap-1",
    "lg:grid-cols-1",
    "grid-flow-col lg:grid-flow-row",
    "scroll-px-6 overflow-x-scroll md:overflow-x-auto",
    "snap-x snap-mandatory",
  ],
  {
    variants: {
      gridSize: {
        "1x1": "",
        "2x2": "2xl:grid-cols-2",
        mix: "2xl:grid-cols-2",
      },
    },
  },
);

export function getSelectedVariantMediaIndex(
  media: MediaFragment[],
  selectedVariant: ProductVariantFragment,
) {
  if (!selectedVariant) {
    return 0;
  }
  const mediaUrl = selectedVariant.image?.url;
  return media.findIndex((med) => med.previewImage?.url === mediaUrl);
}
