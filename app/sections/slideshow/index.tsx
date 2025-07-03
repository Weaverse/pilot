import {
  createSchema,
  type HydrogenComponentProps,
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
  dotsPosition: "top" | "bottom" | "left" | "right";
  dotsColor: "light" | "dark";
  loop: boolean;
  autoRotate: boolean;
  changeSlidesEvery: number;
}

const Slideshow = forwardRef<
  HTMLDivElement,
  SlideshowData & HydrogenComponentProps
>((props, ref) => {
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
    dotsPosition,
    dotsColor,
    loop,
    autoRotate,
    changeSlidesEvery,
    children = [],
    ...rest
  } = props;
  const { enableTransparentHeader } = useThemeSettings();

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
              "dot cursor-pointer rounded-full",
              "h-2.5 w-2.5 p-0",
              "outline-2 outline-solid outline-transparent outline-offset-3",
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

export const schema = createSchema({
  title: "Slideshow",
  type: "slideshow",
  childTypes: ["slideshow-slide"],
  settings: [
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
          condition: (data: SlideshowData) => data.autoRotate,
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
          condition: (data: SlideshowData) => data.showArrows,
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
          condition: (data: SlideshowData) => data.showArrows,
        },
        {
          type: "switch",
          label: "Show arrows on hover",
          name: "showArrowsOnHover",
          defaultValue: true,
          condition: (data: SlideshowData) => data.showArrows,
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
          condition: (data: SlideshowData) => data.showArrows,
        },
        {
          type: "toggle-group",
          label: "Arrows shape",
          name: "arrowsShape",
          configs: {
            options: [
              { value: "rounded-sm", label: "Rounded", icon: "squircle" },
              { value: "circle", label: "Circle", icon: "circle" },
              { value: "square", label: "Square", icon: "square" },
            ],
          },
          defaultValue: "rounded-sm",
          condition: (data: SlideshowData) => data.showArrows,
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
          condition: (data: SlideshowData) => data.showDots,
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
          condition: (data: SlideshowData) => data.showDots,
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
});
