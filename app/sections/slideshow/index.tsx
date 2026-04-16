import {
  type HydrogenComponentProps,
  useThemeSettings,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { ScrollReveal } from "~/components/scroll-reveal";
import { useWeaverseStudioCheck } from "~/hooks/use-weaverse-studio-check";
import type { ThemeSettings } from "~/types/weaverse";
import type { SlideshowArrowsProps } from "./arrows";
import { Arrows } from "./arrows";
import type { SlideshowDotsProps } from "./dots";
import { Dots } from "./dots";

const variants = cva("group [&_.swiper]:h-full", {
  variants: {
    height: {
      small: "h-[40vh] lg:h-[50vh]",
      medium: "h-[50vh] lg:h-[60vh]",
      large: "h-[70vh] lg:h-[80vh]",
      full: "",
    },
    enableTransparentHeader: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      height: "full",
      enableTransparentHeader: true,
      className: "h-screen-no-topbar",
    },
    {
      height: "full",
      enableTransparentHeader: false,
      className: "h-screen-dynamic",
    },
  ],
  defaultVariants: {
    height: "large",
  },
});

export interface SlideshowData
  extends VariantProps<typeof variants>,
    SlideshowArrowsProps,
    SlideshowDotsProps {
  effect?: "fade" | "slide";
  showArrows: boolean;
  showDots: boolean;
  dotsStyle: "circle" | "line" | "dash";
  dotsPosition: "top" | "bottom" | "left" | "right";
  dotsColor: "light" | "dark";
  loop: boolean;
  autoRotate: boolean;
  changeSlidesEvery: number;
}

export default function Slideshow(
  props: SlideshowData & HydrogenComponentProps,
) {
  const {
    height,
    effect,
    showArrows,
    arrowsIcon,
    iconSize,
    showArrowsOnHover,
    arrowsColor,
    arrowsShape,
    showDots = true,
    dotsStyle = "circle",
    dotsPosition,
    dotsColor,
    loop,
    autoRotate,
    changeSlidesEvery,
    children = [],
    ...rest
  } = props;

  const { enableTransparentHeader } = useThemeSettings<ThemeSettings>();
  let isDesignMode = useWeaverseStudioCheck();
  let shouldAutoRotate = autoRotate && !isDesignMode;

  return (
    <ScrollReveal
      as="section"
      key={Object.values(props)
        .filter((v) => typeof v !== "object")
        .join("-")}
      {...rest}
      className={variants({ height, enableTransparentHeader })}
    >
      <Swiper
        effect={effect}
        loop={loop}
        autoplay={
          shouldAutoRotate ? { delay: changeSlidesEvery * 1000 } : false
        }
        navigation={
          showArrows && {
            nextEl: ".slideshow-arrow-next",
            prevEl: ".slideshow-arrow-prev",
          }
        }
        pagination={
          showDots && {
            el: ".slideshow-dots",
            clickable: true,
            bulletClass: clsx(
              "dot cursor-pointer p-0",
              "transition-all duration-200",
              dotsStyle === "circle" && [
                "h-2.5 w-2.5 rounded-full",
                "outline-2 outline-solid outline-transparent outline-offset-3",
              ],
              dotsStyle === "line" && "h-2 w-6 rounded-full",
              dotsStyle === "dash" && "h-1 w-12 rounded-full",
            ),
            bulletActiveClass: "active",
          }
        }
        modules={[
          EffectFade,
          shouldAutoRotate ? Autoplay : null,
          showArrows ? Navigation : null,
          showDots ? Pagination : null,
        ].filter(Boolean)}
      >
        {children.map((child, idx) => (
          <SwiperSlide key={idx} className="bg-white">
            {child}
          </SwiperSlide>
        ))}
        {showArrows && (
          <Arrows
            arrowsIcon={arrowsIcon}
            iconSize={iconSize}
            arrowsColor={arrowsColor}
            showArrowsOnHover={showArrowsOnHover}
            arrowsShape={arrowsShape}
          />
        )}
        {showDots && (
          <Dots
            dotsStyle={dotsStyle}
            dotsPosition={dotsPosition}
            dotsColor={dotsColor}
          />
        )}
      </Swiper>
    </ScrollReveal>
  );
}

export { schema } from "./schema";
