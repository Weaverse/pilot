import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import { useEffect, useState } from "react";
import type {
  MediaFragment,
  ProductVariantFragment,
} from "storefront-api.generated";
import type { ImageAspectRatio } from "~/types/others";
import { cn } from "~/utils/cn";
import { MediaItem } from "./media-item";
import { ZoomButton, ZoomModal } from "./media-zoom";

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

interface MediaGridProps {
  allMedia: MediaFragment[];
  displayMedia: MediaFragment[];
  gridSize: "1x1" | "2x2" | "mix";
  imageAspectRatio?: ImageAspectRatio;
  enableZoom?: boolean;
  zoomTrigger?: "image" | "button" | "both";
  zoomButtonVisibility?: "always" | "hover";
  selectedVariant: ProductVariantFragment;
  initialMediaCount?: number;
  showMoreText?: string;
  showLessText?: string;
}

export function MediaGrid({
  allMedia,
  displayMedia,
  gridSize,
  imageAspectRatio,
  enableZoom,
  zoomTrigger = "button",
  zoomButtonVisibility = "hover",
  selectedVariant,
  initialMediaCount = 0,
  showMoreText = "Show more",
  showLessText = "Show less",
}: MediaGridProps) {
  const [expanded, setExpanded] = useState(false);
  const [zoomMediaId, setZoomMediaId] = useState<string | null>(null);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset expanded state on variant change
  useEffect(() => {
    setExpanded(false);
  }, [selectedVariant]);

  const shouldShowButton =
    enableZoom && (zoomTrigger === "button" || zoomTrigger === "both");
  const canClickImage =
    enableZoom && (zoomTrigger === "image" || zoomTrigger === "both");

  const shouldLimitMedia =
    initialMediaCount > 0 && displayMedia.length > initialMediaCount;
  const visibleMedia =
    shouldLimitMedia && !expanded
      ? displayMedia.slice(0, initialMediaCount)
      : displayMedia;
  const hiddenCount = displayMedia.length - visibleMedia.length;

  return (
    <>
      <div className="relative">
        <div className={mediaGridVariants({ gridSize })}>
          {displayMedia.map((med, idx) => {
            const isLast = idx === visibleMedia.length - 1;
            const isHiddenOnDesktop =
              shouldLimitMedia && !expanded && idx >= initialMediaCount;
            return (
              <div
                key={med.id}
                className={clsx(
                  "group relative",
                  gridSize === "2x2" &&
                    isLast &&
                    visibleMedia.length % 2 === 1 &&
                    "2xl:col-span-2",
                  gridSize === "mix" &&
                    (idx % 3 === 0 || (isLast && idx % 3 === 1)) &&
                    "lg:col-span-2",
                  isHiddenOnDesktop && "lg:hidden",
                )}
              >
                <div
                  onClick={
                    canClickImage
                      ? () => {
                          setZoomMediaId(med.id);
                          setZoomModalOpen(true);
                        }
                      : undefined
                  }
                  className={canClickImage ? "cursor-zoom-in" : ""}
                >
                  <MediaItem
                    media={med}
                    imageAspectRatio={imageAspectRatio}
                    index={idx}
                    className={cn(
                      "w-[80vw] max-w-none object-cover lg:h-full lg:w-full",
                      idx === 0 &&
                        "[&_img]:[view-transition-name:image-expand]",
                    )}
                  />
                </div>
                {shouldShowButton && (
                  <ZoomButton
                    className={clsx(
                      "absolute top-2 right-2 md:top-4 md:right-4",
                      zoomButtonVisibility === "hover" &&
                        "opacity-0 group-hover:opacity-100",
                    )}
                    onClick={() => {
                      setZoomMediaId(med.id);
                      setZoomModalOpen(true);
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        {shouldLimitMedia && !expanded && (
          <button
            type="button"
            className="absolute right-0 bottom-0 left-0 hidden cursor-pointer items-end justify-center bg-linear-to-t from-white/80 via-white/60 to-transparent pt-50 pb-10 font-medium text-body transition-opacity lg:flex"
            onClick={() => setExpanded(true)}
            aria-label={`${showMoreText} (+${hiddenCount})`}
          >
            <span className="flex flex-col items-center gap-1">
              <CaretDownIcon className="h-4 w-4" />
              <span className="underline underline-offset-4">
                {`${showMoreText} (+${hiddenCount})`}
              </span>
            </span>
          </button>
        )}
        {shouldLimitMedia && expanded && (
          <button
            type="button"
            className="mt-6 hidden w-full cursor-pointer items-center justify-center gap-1 py-2 font-medium lg:mt-2 lg:flex"
            onClick={() => setExpanded(false)}
            aria-label={showLessText}
          >
            <span className="flex flex-col items-center gap-1">
              <CaretUpIcon className="h-4 w-4" />
              <span className="underline underline-offset-4">
                {showLessText}
              </span>
            </span>
          </button>
        )}
      </div>
      {enableZoom && (
        <ZoomModal
          media={allMedia}
          zoomMediaId={zoomMediaId}
          setZoomMediaId={setZoomMediaId}
          open={zoomModalOpen}
          onOpenChange={setZoomModalOpen}
        />
      )}
    </>
  );
}
