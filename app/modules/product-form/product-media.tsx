import { Image } from "@shopify/hydrogen";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import { useEffect, useState } from "react";
import type { MediaFragment } from "storefrontapi.generated";
import { FreeMode, Pagination, Thumbs } from "swiper/modules";
import { Swiper, type SwiperClass, SwiperSlide } from "swiper/react";
import { getImageAspectRatio } from "~/lib/utils";

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
  }
);

export interface ProductMediaProps extends VariantProps<typeof variants> {
  mediaLayout: "grid" | "slider";
  imageAspectRatio: "adapt" | "1/1" | "4/3" | "3/4" | "16/9";
  showThumbnails: boolean;
  selectedVariant: any;
  media: MediaFragment[];
}

export function ProductMedia(props: ProductMediaProps) {
  let {
    mediaLayout,
    gridSize,
    showThumbnails,
    imageAspectRatio,
    selectedVariant,
    media: _media,
  } = props;
  let media = _media.filter((med) => med.__typename === "MediaImage");
  let [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(
    null
  );
  let [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (swiperInstance && thumbsSwiper) {
      if (swiperInstance.thumbs) {
        swiperInstance.thumbs.swiper = thumbsSwiper;
        swiperInstance.thumbs.init();
      }
      swiperInstance.on("slideChange", () => {
        let realIndex = swiperInstance.realIndex;
        setActiveIndex(realIndex);
        thumbsSwiper.slideTo(realIndex);
      });
    }
  }, [swiperInstance, thumbsSwiper]);

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
                gridSize === "mix" && idx % 3 === 0 && "lg:col-span-2"
              )}
              sizes="auto"
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 overflow-hidden">
      {showThumbnails && (
        <Swiper
          onSwiper={setThumbsSwiper}
          direction="vertical"
          spaceBetween={10}
          freeMode
          slidesPerView={5}
          threshold={2}
          modules={[FreeMode, Thumbs]}
          className="!w-20 shrink-0 max-h-[450px] overflow-visible hidden md:block"
        >
          {media.map((med, i) => {
            let image = { ...med.image, altText: med.alt || "Product image" };
            return (
              <SwiperSlide
                key={med.id}
                className={clsx(
                  "!h-[100px] p-1 border transition-colors aspect-[3/4] cursor-pointer",
                  activeIndex === i ? "border-black" : "border-transparent"
                )}
              >
                <Image
                  data={image}
                  loading={i === 0 ? "eager" : "lazy"}
                  width={100}
                  height={100}
                  aspectRatio={"3/4"}
                  className="object-cover opacity-0 animate-fade-in w-full h-full"
                  sizes="auto"
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
      <Swiper
        onSwiper={setSwiperInstance}
        modules={[FreeMode, Thumbs, Pagination]}
        pagination={{ type: "fraction" }}
        spaceBetween={10}
        thumbs={
          thumbsSwiper
            ? {
                swiper: thumbsSwiper,
                slideThumbActiveClass: "thumb-active",
              }
            : undefined
        }
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.activeIndex);
        }}
        className="vt-product-image max-w-full pb-14 md:pb-0 md:[&_.swiper-pagination-fraction]:hidden"
        style={
          {
            "--swiper-pagination-bottom": "20px",
          } as React.CSSProperties
        }
      >
        {media.map((med, i) => {
          let image = { ...med.image, altText: med.alt || "Product image" };
          return (
            <SwiperSlide key={med.id}>
              <Image
                data={image}
                loading={i === 0 ? "eager" : "lazy"}
                aspectRatio={"3/4"}
                className="object-cover w-full h-auto opacity-0 animate-fade-in"
                sizes="auto"
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
