import { Image } from "@shopify/hydrogen";
import { useState } from "react";
import type { MediaFragment } from "storefrontapi.generated";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { Swiper, type SwiperClass, SwiperSlide } from "swiper/react";

interface ProductMediaProps {
  selectedVariant: any;
  media: MediaFragment[];
  showThumbnails: boolean;
  numberOfThumbnails: number;
  spacing: number;
}

export function ProductMedia(props: ProductMediaProps) {
  let { selectedVariant, media: _media, numberOfThumbnails, spacing } = props;
  let media = _media.filter((med) => med.__typename === "MediaImage");
  let [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);

  return (
    <div className="flex flex-row-reverse gap-4" style={{ height: 800 }}>
      <Swiper
        modules={[Thumbs]}
        spaceBetween={10}
        thumbs={thumbsSwiper ? { swiper: thumbsSwiper } : undefined}
      >
        {media.map((med, i) => {
          let image = { ...med.image, altText: med.alt || "Product image" };
          return (
            <SwiperSlide key={med.id}>
              <Image
                data={image}
                loading={i === 0 ? "eager" : "lazy"}
                aspectRatio={"3/4"}
                className="object-cover w-full h-auto fadeIn"
                sizes="auto"
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
      <Swiper
        onSwiper={setThumbsSwiper}
        direction="vertical"
        spaceBetween={spacing}
        freeMode
        slidesPerView={5}
        modules={[FreeMode, Thumbs]}
        className="max-h-[450px]"
      >
        {media.map((med, i) => {
          let image = { ...med.image, altText: med.alt || "Product image" };
          return (
            <SwiperSlide key={med.id}>
              <Image
                data={image}
                loading={i === 0 ? "eager" : "lazy"}
                aspectRatio={"3/4"}
                className="object-cover h-auto fadeIn w-20"
                sizes="auto"
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
