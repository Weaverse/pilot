import {
  ArrowLeftIcon,
  ArrowRightIcon,
  VideoCameraIcon,
} from "@phosphor-icons/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import type {
  MediaFragment,
  ProductVariantFragment,
} from "storefront-api.generated";
import { FreeMode, Navigation, Pagination, Thumbs } from "swiper/modules";
import { Swiper, type SwiperClass, SwiperSlide } from "swiper/react";
import { Image } from "~/components/image";
import type { ImageAspectRatio } from "~/types/others";
import { cn } from "~/utils/cn";
import { MediaItem } from "./media-item";
import { ZoomButton, ZoomModal } from "./media-zoom";

interface MediaSliderProps {
  allMedia: MediaFragment[];
  displayMedia: MediaFragment[];
  selectedVariant: ProductVariantFragment;
  showThumbnails: boolean;
  imageAspectRatio?: ImageAspectRatio;
  enableZoom?: boolean;
  zoomTrigger?: "image" | "button" | "both";
  zoomButtonVisibility?: "always" | "hover";
  groupMediaByVariant?: boolean;
}

export function MediaSlider({
  allMedia,
  displayMedia,
  selectedVariant,
  showThumbnails,
  imageAspectRatio,
  enableZoom,
  zoomTrigger = "button",
  zoomButtonVisibility = "hover",
  groupMediaByVariant,
}: MediaSliderProps) {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomMediaId, setZoomMediaId] = useState<string | null>(null);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: change the slide when selectedVariant changes
  useEffect(() => {
    if (!swiper) {
      return;
    }

    if (groupMediaByVariant) {
      // When variant grouping is enabled, reset to first slide
      setActiveIndex(0);
      swiper.slideToLoop(0, 0);
    } else {
      // When variant grouping is off, navigate to the selected variant's image
      let variantImageUrl = selectedVariant.image?.url;
      if (variantImageUrl) {
        let targetIndex = displayMedia.findIndex(
          (med) => med.previewImage?.url === variantImageUrl,
        );
        if (targetIndex !== -1) {
          setActiveIndex(targetIndex);
          swiper.slideToLoop(targetIndex, 0);
        }
      }
    }
  }, [selectedVariant]);

  const shouldShowButton =
    enableZoom && (zoomTrigger === "button" || zoomTrigger === "both");
  const canClickImage =
    enableZoom && (zoomTrigger === "image" || zoomTrigger === "both");

  return (
    <div className="product-media-slider overflow-hidden">
      <div className="flex items-start gap-4 overflow-hidden">
        {showThumbnails && (
          <div
            className={clsx(
              "hidden shrink-0 md:block",
              "h-112.5 w-[calc(var(--thumbs-width,0px)-1rem)]",
              "opacity-0 transition-opacity duration-300",
            )}
          >
            <Swiper
              onSwiper={setThumbsSwiper}
              direction="vertical"
              spaceBetween={8}
              slidesPerView={5}
              watchSlidesProgress
              rewind
              freeMode
              className="h-full w-full overflow-visible"
              onInit={(sw) => {
                sw.el.parentElement.style.opacity = "1";
              }}
              modules={[Navigation, Thumbs, FreeMode]}
            >
              {displayMedia.map(
                ({ id, previewImage, alt, mediaContentType }, idx) => {
                  return (
                    <SwiperSlide
                      key={id}
                      className={cn(
                        "relative",
                        "h-auto! cursor-pointer border p-1 transition-colors",
                        idx === activeIndex
                          ? "border-line"
                          : "border-transparent",
                      )}
                      onClick={() => swiper?.slideToLoop(idx)}
                    >
                      <Image
                        data={{
                          ...previewImage,
                          altText: alt || "Product image",
                        }}
                        loading="lazy"
                        width={200}
                        aspectRatio="1/1"
                        className="h-auto w-full object-cover"
                        sizes="auto"
                      />
                      {mediaContentType === "VIDEO" && (
                        <div className="absolute right-2 bottom-2 bg-gray-900 p-0.5 text-white">
                          <VideoCameraIcon className="h-4 w-4" />
                        </div>
                      )}
                    </SwiperSlide>
                  );
                },
              )}
            </Swiper>
          </div>
        )}
        <div className="relative w-[calc(100%-var(--thumbs-width,0px))]">
          <Swiper
            onSwiper={setSwiper}
            onSlideChange={(sw) => setActiveIndex(sw.realIndex)}
            thumbs={{ swiper: thumbsSwiper }}
            slidesPerView={1}
            spaceBetween={4}
            breakpointsBase="container"
            breakpoints={{
              700: {
                slidesPerView: 2,
                spaceBetween: 4,
              },
            }}
            autoHeight
            loop
            navigation={{
              nextEl: ".media_slider__next",
              prevEl: ".media_slider__prev",
            }}
            pagination={{ type: "fraction" }}
            modules={[Pagination, Navigation, Thumbs]}
            className="overflow-visible pb-10 md:overflow-hidden md:pb-0 md:[&_.swiper-pagination]:hidden"
          >
            {displayMedia.map((med, idx) => {
              return (
                <SwiperSlide key={med.id} className="group bg-gray-100">
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
                      className={
                        idx === 0 &&
                        "[&_img]:[view-transition-name:image-expand]"
                      }
                    />
                  </div>
                  {shouldShowButton && (
                    <ZoomButton
                      className={clsx(
                        "absolute top-2 right-2 md:top-6 md:right-6",
                        zoomButtonVisibility === "hover" &&
                          "opacity-0 group-hover:opacity-100",
                      )}
                      onClick={() => {
                        setZoomMediaId(med.id);
                        setZoomModalOpen(true);
                      }}
                    />
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>
          <div className="absolute right-6 bottom-6 z-1 hidden items-center gap-2 md:flex">
            <button
              type="button"
              className="media_slider__prev left-6 border border-transparent bg-white p-2 text-center text-gray-900 transition-all duration-200 hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:text-body-subtle"
            >
              <ArrowLeftIcon className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              className="media_slider__next right-6 border border-transparent bg-white p-2 text-center text-gray-900 transition-all duration-200 hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:text-body-subtle"
            >
              <ArrowRightIcon className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
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
    </div>
  );
}
