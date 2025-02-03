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
import { Navigation, Pagination, Thumbs } from "swiper/modules";
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
    <div className="overflow-hidden product-media-slider">
      <div
        className={clsx(
          "flex items-start gap-4 [--thumbs-width:0px]",
          showThumbnails && "md:[--thumbs-width:8rem]",
        )}
      >
        {showThumbnails && (
          <div
            className={clsx(
              "shrink-0 hidden md:block",
              "h-[450px] w-[calc(var(--thumbs-width,0px)-1rem)]",
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
              className="w-full h-full overflow-visible"
              onInit={(sw) => {
                sw.el.parentElement.style.opacity = "1";
              }}
              modules={[Navigation, Thumbs]}
            >
              {media.map(({ id, previewImage, alt, mediaContentType }) => {
                return (
                  <SwiperSlide
                    key={id}
                    className={cn(
                      "relative",
                      "p-1 border rounded-md transition-colors cursor-pointer border-transparent !h-auto",
                      "[&.swiper-slide-thumb-active]:border-line",
                    )}
                  >
                    <Image
                      data={{
                        ...previewImage,
                        altText: alt || "Product image",
                      }}
                      loading="lazy"
                      width={200}
                      aspectRatio="1/1"
                      className="object-cover opacity-0 animate-fade-in w-full h-auto rounded"
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
          </div>
        )}
        <div className="relative w-[calc(100%-var(--thumbs-width,0px))]">
          <Swiper
            onSwiper={setSwiper}
            thumbs={{ swiper: thumbsSwiper }}
            slidesPerView={1}
            spaceBetween={4}
            autoHeight
            loop
            navigation={{
              nextEl: ".media_slider__next",
              prevEl: ".media_slider__prev",
            }}
            pagination={{ type: "fraction" }}
            modules={[Pagination, Navigation, Thumbs]}
            className="overflow-visible rounded md:overflow-hidden pb-10 md:pb-0 md:[&_.swiper-pagination]:hidden"
          >
            {media.map((media, idx) => {
              if (media.mediaContentType === "IMAGE") {
                let { image, alt, id } = media as Media_MediaImage_Fragment;
                return (
                  <SwiperSlide key={id}>
                    <Image
                      data={{ ...image, altText: alt || "Product image" }}
                      loading={idx === 0 ? "eager" : "lazy"}
                      className="object-cover w-full h-auto opacity-0 animate-fade-in rounded"
                      width={2048}
                      aspectRatio={getImageAspectRatio(image, imageAspectRatio)}
                      sizes="auto"
                    />
                  </SwiperSlide>
                );
              }
              if (media.mediaContentType === "VIDEO") {
                let mediaVideo = media as Media_Video_Fragment;
                return (
                  <SwiperSlide key={mediaVideo.id}>
                    <video
                      controls
                      className="w-full h-auto object-cover rounded"
                      style={{ aspectRatio: imageAspectRatio }}
                    >
                      <track kind="captions" />
                      <source
                        src={mediaVideo.sources[0].url}
                        type="video/mp4"
                      />
                    </video>
                  </SwiperSlide>
                );
              }
              return null;
            })}
          </Swiper>
          <div className="absolute bottom-6 right-6 z-10 hidden md:flex items-center gap-2">
            <button
              type="button"
              className="media_slider__prev p-2 text-center border border-transparent transition-all duration-200 text-gray-900 bg-white hover:bg-gray-800 hover:text-white rounded-lg left-6 disabled:cursor-not-allowed disabled:text-body-subtle"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </button>
            <button
              type="button"
              className="media_slider__next p-2 text-center border border-transparent transition-all duration-200 text-gray-900 bg-white hover:bg-gray-800 hover:text-white rounded-lg right-6 disabled:cursor-not-allowed disabled:text-body-subtle"
            >
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>
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
