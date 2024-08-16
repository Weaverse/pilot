import { Image } from "@shopify/hydrogen";
import clsx from "clsx";
import { useState } from "react";
import type { MediaFragment } from "storefrontapi.generated";
import { FreeMode, Pagination, Thumbs } from "swiper/modules";
import { Swiper, type SwiperClass, SwiperSlide } from "swiper/react";

export interface ProductMediaProps {
  mediaLayout: "grid" | "slider";
  showThumbnails: boolean;
  selectedVariant: any;
  media: MediaFragment[];
}

export function ProductMedia(props: ProductMediaProps) {
  let { mediaLayout, selectedVariant, media: _media } = props;
  let media = _media.filter((med) => med.__typename === "MediaImage");
  let [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  let [activeIndex, setActiveIndex] = useState(0);

  if (mediaLayout === "grid") {
    return (
      <div className="grid grid-cols-2 gap-1">
        {media.map((med, i) => {
          let image = { ...med.image, altText: med.alt || "Product image" };
          return (
            <Image
              key={med.id}
              data={image}
              loading={i === 0 ? "eager" : "lazy"}
              width={1660}
              height={1660}
              aspectRatio={"3/4"}
              className="object-cover opacity-0 animate-fadeIn w-full h-full"
              sizes="auto"
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 overflow-hidden">
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
                activeIndex === i ? "border-black" : "border-transparent",
              )}
            >
              <Image
                data={image}
                loading={i === 0 ? "eager" : "lazy"}
                width={100}
                height={100}
                aspectRatio={"3/4"}
                className="object-cover opacity-0 animate-fadeIn w-full h-full"
                sizes="auto"
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
      <Swiper
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
                className="object-cover w-full h-auto opacity-0 animate-fadeIn"
                sizes="auto"
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
