import {
  type HydrogenComponentProps,
  type HydrogenComponentSchema,
  IMAGES_PLACEHOLDERS,
  useThemeSettings,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import { forwardRef } from "react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { SlideshowArrowsProps } from "./arrows";
import { Arrows } from "./arrows";
import type { SlideshowDotsProps } from "./dots";
import { Dots } from "./dots";

let variants = cva("group [&_.swiper]:h-full", {
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
      className: "h-screen",
    },
    {
      height: "full",
      enableTransparentHeader: false,
      className: "h-screen-no-nav",
    },
  ],
  defaultVariants: {
    height: "large",
  },
});

export interface SlideshowProps
  extends VariantProps<typeof variants>,
    SlideshowArrowsProps,
    SlideshowDotsProps,
    HydrogenComponentProps {
  effect?: "fade" | "slide";
  showArrows: boolean;
  showDots: boolean;
  dotsPosition: "top" | "bottom" | "left" | "right";
  dotsColor: "light" | "dark";
  loop: boolean;
  autoRotate: boolean;
  changeSlidesEvery: number;
}

let Slideshow = forwardRef<HTMLDivElement, SlideshowProps>((props, ref) => {
  let {
    height,
    effect,
    showArrows,
    arrowsIcon,
    iconSize,
    showArrowsOnHover,
    arrowsColor,
    arrowsShape,
    showDots = true,
    dotsPosition,
    dotsColor,
    loop,
    autoRotate,
    changeSlidesEvery,
    children = [],
    ...rest
  } = props;
  let { enableTransparentHeader } = useThemeSettings();

  return (
    <section
      key={Object.values(props)
        .filter((v) => typeof v !== "object")
        .join("-")}
      ref={ref}
      {...rest}
      className={variants({ height, enableTransparentHeader })}
    >
      <Swiper
        effect={effect}
        loop={loop}
        autoplay={autoRotate ? { delay: changeSlidesEvery * 1000 } : false}
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
              "dot rounded-full cursor-pointer",
              "w-2.5 h-2.5 p-0",
              "outline outline-offset-3 outline-2 outline-transparent",
              "transition-all duration-200",
            ),
            bulletActiveClass: "active",
          }
        }
        modules={[
          EffectFade,
          autoRotate ? Autoplay : null,
          showArrows ? Navigation : null,
          showDots ? Pagination : null,
        ].filter(Boolean)}
      >
        {children.map((child, idx) => (
          <SwiperSlide key={idx} className="bg-white">
            {child}
          </SwiperSlide>
        ))}
        {showArrows && <Arrows {...props} />}
        {showDots && <Dots {...props} />}
      </Swiper>
    </section>
  );
});

export default Slideshow;

export let schema: HydrogenComponentSchema = {
  title: "Slideshow",
  type: "slideshow",
  childTypes: ["slideshow-slide"],
  inspector: [
    {
      group: "Slideshow",
      inputs: [
        {
          type: "select",
          name: "height",
          label: "Section height",
          configs: {
            options: [
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
              { value: "full", label: "Fullscreen" },
            ],
          },
          defaultValue: "large",
        },
        {
          type: "toggle-group",
          label: "Slide effect",
          name: "effect",
          configs: {
            options: [
              { value: "fade", label: "Fade" },
              { value: "slide", label: "Slide" },
            ],
          },
          defaultValue: "fade",
        },
        {
          type: "switch",
          label: "Auto-rotate slides",
          name: "autoRotate",
          defaultValue: true,
        },
        {
          type: "range",
          label: "Change slides every",
          name: "changeSlidesEvery",
          configs: {
            min: 3,
            max: 9,
            step: 1,
            unit: "s",
          },
          defaultValue: 5,
          condition: "autoRotate.eq.true",
          helpText: "Auto-rotate is disabled inside Weaverse Studio.",
        },
        {
          type: "switch",
          label: "Loop",
          name: "loop",
          defaultValue: true,
        },
      ],
    },
    {
      group: "Navigation & Controls",
      inputs: [
        {
          type: "heading",
          label: "Arrows",
        },
        {
          type: "switch",
          label: "Show arrows",
          name: "showArrows",
          defaultValue: false,
        },
        {
          type: "select",
          label: "Arrow icon",
          name: "arrowsIcon",
          configs: {
            options: [
              { value: "caret", label: "Caret" },
              { value: "arrow", label: "Arrow" },
            ],
          },
          defaultValue: "arrow",
          condition: "showArrows.eq.true",
        },
        {
          type: "range",
          label: "Icon size",
          name: "iconSize",
          configs: {
            min: 16,
            max: 40,
            step: 2,
          },
          defaultValue: 20,
          condition: "showArrows.eq.true",
        },
        {
          type: "switch",
          label: "Show arrows on hover",
          name: "showArrowsOnHover",
          defaultValue: true,
          condition: "showArrows.eq.true",
        },
        {
          type: "select",
          label: "Arrows color",
          name: "arrowsColor",
          configs: {
            options: [
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ],
          },
          defaultValue: "light",
          condition: "showArrows.eq.true",
        },
        {
          type: "toggle-group",
          label: "Arrows shape",
          name: "arrowsShape",
          configs: {
            options: [
              { value: "rounded", label: "Rounded", icon: "squircle" },
              { value: "circle", label: "Circle", icon: "circle" },
              { value: "square", label: "Square", icon: "square" },
            ],
          },
          defaultValue: "rounded",
          condition: "showArrows.eq.true",
        },

        {
          type: "heading",
          label: "Dots",
        },
        {
          type: "switch",
          label: "Show dots",
          name: "showDots",
          defaultValue: true,
        },
        {
          type: "select",
          label: "Dots position",
          name: "dotsPosition",
          configs: {
            options: [
              { value: "top", label: "Top" },
              { value: "bottom", label: "Bottom" },
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ],
          },
          defaultValue: "bottom",
          condition: "showDots.eq.true",
        },
        {
          type: "select",
          label: "Dots color",
          name: "dotsColor",
          configs: {
            options: [
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ],
          },
          defaultValue: "light",
          condition: "showDots.eq.true",
        },
      ],
    },
  ],
  presets: {
    children: [
      {
        type: "slideshow-slide",
        verticalPadding: "large",
        contentPosition: "center center",
        backgroundImage: IMAGES_PLACEHOLDERS.banner_1,
        backgroundFit: "cover",
        enableOverlay: true,
        overlayOpacity: 50,
        children: [
          {
            type: "subheading",
            content: "Limited time offer",
            color: "#fff",
          },
          {
            type: "heading",
            content: "Spring / Summer 2024 Sale",
            color: "#fff",
            size: "scale",
            minSize: 16,
            maxSize: 56,
          },
          {
            type: "paragraph",
            content:
              "It's hard to be nice if you don't feel comfortable. All the ready-to-wear and accessories you need for your next summer vacation is now up to 50% off.",
            color: "#fff",
          },
          {
            type: "button",
            text: "Shop collection",
            variant: "custom",
            backgroundColor: "#00000000",
            textColor: "#fff",
            borderColor: "#fff",
            backgroundColorHover: "#fff",
            textColorHover: "#000",
            borderColorHover: "#fff",
          },
        ],
      },
      {
        type: "slideshow-slide",
        verticalPadding: "large",
        contentPosition: "center center",
        backgroundImage: IMAGES_PLACEHOLDERS.banner_2,
        backgroundFit: "cover",
        enableOverlay: true,
        overlayOpacity: 50,
        children: [
          {
            type: "subheading",
            content: "Exclusive offer",
            color: "#fff",
          },
          {
            type: "heading",
            content: "Autumn / Winter 2024 Sale",
            color: "#fff",
            size: "scale",
            minSize: 16,
            maxSize: 56,
          },
          {
            type: "paragraph",
            content:
              "Stay warm and stylish with our winter collection. All the ready-to-wear and accessories you need for your next winter vacation is now up to 60% off.",
            color: "#fff",
          },
          {
            type: "button",
            text: "Shop collection",
            variant: "custom",
            backgroundColor: "#00000000",
            textColor: "#fff",
            borderColor: "#fff",
            backgroundColorHover: "#fff",
            textColorHover: "#000",
            borderColorHover: "#fff",
          },
        ],
      },
    ],
  },
};
