import { ArrowLeft, ArrowRight, VideoCamera } from "@phosphor-icons/react";
import { Image } from "@shopify/hydrogen";
import { type VariantProps, cva } from "class-variance-authority";
import clsx from "clsx";
import { useEffect, useState } from "react";
import type {
  MediaFragment,
  Media_MediaImage_Fragment,
  Media_Video_Fragment,
  ProductVariantFragment,
} from "storefront-api.generated";
import {
  EffectFade,
  FreeMode,
  Navigation,
  Pagination,
  Thumbs,
} from "swiper/modules";
import { Swiper, type SwiperClass, SwiperSlide } from "swiper/react";
import type { ImageAspectRatio } from "~/types/image";
import { cn } from "~/utils/cn";
import { getImageAspectRatio } from "~/utils/image";

let variants = cva(
  [
    "w-full grid justify-start gap-2 lg:gap-1",
    "lg:grid-cols-1",
    "grid-flow-col lg:grid-flow-row",
    "overflow-x-scroll scroll-px-6",
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

export interface ProductMediaProps extends VariantProps<typeof variants> {
  mediaLayout: "grid" | "slider";
  imageAspectRatio: ImageAspectRatio;
  showThumbnails: boolean;
  selectedVariant: ProductVariantFragment;
  media: MediaFragment[];
}

function updateMainSwiperHeight(sw: SwiperClass) {
  if (sw?.height) {
    let activeSlide = sw.slides[sw.activeIndex];
    if (activeSlide) {
      sw.el.parentElement.style.setProperty(
        "--swiper-height",
        `${activeSlide.clientHeight}px`,
      );
    }
  }
}

export function ProductMedia(props: ProductMediaProps) {
  let {
    mediaLayout,
    gridSize,
    showThumbnails,
    imageAspectRatio,
    selectedVariant,
    media,
  } = props;

  let [swiper, setSwiper] = useState<SwiperClass | null>(null);
  let [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (selectedVariant && swiper) {
      let index = getSelectedVariantMediaIndex(media, selectedVariant);
      if (index !== swiper.activeIndex) {
        swiper.slideTo(index);
      }
    }
  }, [selectedVariant]);

  if (mediaLayout === "grid") {
    return (
      <div className={variants({ gridSize })}>
        {media.map((med, idx) => {
          let image = { ...med.image, altText: med.alt || "Product image" };
          return (
            <Image
              key={med.id}
              data={image}
              loading={idx === 0 ? "eager" : "lazy"}
              width={1660}
              height={1660}
              aspectRatio={getImageAspectRatio(image, imageAspectRatio)}
              className={clsx(
                "object-cover opacity-0 animate-fade-in w-[80vw] max-w-none lg:w-full lg:h-full",
                gridSize === "mix" && idx % 3 === 0 && "lg:col-span-2",
              )}
              sizes="auto"
            />
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col-reverse md:flex-row gap-4 overflow-hidden"
      style={
        {
          "--thumbs-max-height": "550px",
        } as React.CSSProperties
      }
    >
      {showThumbnails && (
        <Swiper
          direction="vertical"
          spaceBetween={10}
          freeMode
          slidesPerView={5}
          threshold={2}
          modules={[FreeMode, Thumbs, Navigation]}
          watchSlidesProgress
          onSwiper={setThumbsSwiper}
          className={clsx([
            "hidden md:block",
            "!w-28 shrink-0 max-h-[--thumbs-max-height]",
            "transition-opacity opacity-100",
          ])}
        >
          {media.map(({ id, previewImage, alt, mediaContentType }, i) => {
            return (
              <SwiperSlide
                key={id}
                className={cn(
                  "p-1 border transition-colors cursor-pointer border-transparent !h-auto",
                  "[&.swiper-slide-thumb-active]:border-line",
                )}
              >
                <Image
                  data={{ ...previewImage, altText: alt || "Product image" }}
                  loading={i === 0 ? "eager" : "lazy"}
                  width={200}
                  aspectRatio={getImageAspectRatio(
                    previewImage,
                    imageAspectRatio,
                  )}
                  className="object-cover opacity-0 animate-fade-in w-full h-auto"
                  sizes="auto"
                />
                {mediaContentType === "VIDEO" && (
                  <div className="absolute bottom-2 right-2 bg-gray-900 text-white p-0.5">
                    <VideoCamera className="w-4 h-4" />
                  </div>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
      <Swiper
        onSwiper={setSwiper}
        modules={[FreeMode, Thumbs, Pagination, EffectFade, Navigation]}
        navigation={{
          nextEl: ".slideshow-arrow-next",
          prevEl: ".slideshow-arrow-prev",
        }}
        onInit={(sw) => {
          updateMainSwiperHeight(sw);
          window.removeEventListener("resize", () => {
            updateMainSwiperHeight(sw);
          });
          window.addEventListener("resize", () => {
            updateMainSwiperHeight(sw);
          });
        }}
        onDestroy={(sw) => {
          window.removeEventListener("resize", () => {
            updateMainSwiperHeight(sw);
          });
        }}
        pagination={{ type: "fraction" }}
        spaceBetween={10}
        effect="fade"
        thumbs={{ swiper: thumbsSwiper }}
        initialSlide={getSelectedVariantMediaIndex(media, selectedVariant)}
        onSlideChange={updateMainSwiperHeight}
        className="vt-product-image max-w-full pb-14 md:pb-0 md:[&_.swiper-pagination-fraction]:hidden"
        style={
          {
            "--swiper-pagination-bottom": "20px",
          } as React.CSSProperties
        }
      >
        {media.map((media, i) => {
          if (media.mediaContentType === "IMAGE") {
            let mediaImage = media as Media_MediaImage_Fragment;
            return (
              <SwiperSlide key={mediaImage.id}>
                <Image
                  data={{
                    ...mediaImage.image,
                    altText: mediaImage.alt || "Product image",
                  }}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="object-cover w-full h-auto opacity-0 animate-fade-in"
                  width={2048}
                  aspectRatio={getImageAspectRatio(
                    mediaImage,
                    imageAspectRatio,
                  )}
                  sizes="auto"
                />
              </SwiperSlide>
            );
          }
          if (media.mediaContentType === "VIDEO") {
            let mediaVideo = media as Media_Video_Fragment;
            return (
              <SwiperSlide key={mediaVideo.id}>
                <video controls className="w-full h-auto">
                  <track kind="captions" />
                  <source src={mediaVideo.sources[0].url} type="video/mp4" />
                </video>
              </SwiperSlide>
            );
          }
          return null;
        })}
        <div className="absolute top-[calc(var(--swiper-height)-3.75rem)] right-6 z-10 flex items-center gap-2">
          <button
            type="button"
            className="slideshow-arrow-prev p-2 text-center border border-transparent transition-all duration-200 text-gray-900 bg-white hover:bg-gray-800 hover:text-white rounded-full left-6 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <button
            type="button"
            className="slideshow-arrow-next p-2 text-center border border-transparent transition-all duration-200 text-gray-900 bg-white hover:bg-gray-800 hover:text-white rounded-full right-6 disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </div>
      </Swiper>
    </div>
  );
}

function getSelectedVariantMediaIndex(
  media: MediaFragment[],
  selectedVariant: ProductVariantFragment,
) {
  if (!selectedVariant) return 0;
  let mediaUrl = selectedVariant.image?.url;
  return media.findIndex((med) => med.previewImage?.url === mediaUrl);
}
