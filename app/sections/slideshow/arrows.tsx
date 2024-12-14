import {
  ArrowLeft,
  ArrowRight,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import { useState } from "react";
import { useSwiper } from "swiper/react";

let variants = cva(
  [
    "hidden md:block",
    "absolute top-1/2 -translate-y-1/2 z-1",
    "p-2 text-center cursor-pointer",
    "border border-transparent",
    "transition-all duration-200",
  ],
  {
    variants: {
      arrowsColor: {
        light: "text-gray-900 bg-white hover:bg-gray-100",
        dark: "text-gray-100 bg-gray-900 hover:bg-gray-800",
      },
      arrowsShape: {
        square: "",
        rounded: "rounded-md",
        circle: "rounded-full",
      },
      disabled: {
        true: "opacity-75 cursor-not-allowed",
        false: "",
      },
      showArrowsOnHover: { true: "", false: "" },
      side: { left: "", right: "" },
    },
    compoundVariants: [
      {
        showArrowsOnHover: true,
        side: "left",
        className: "-left-12 group-hover:left-6",
      },
      {
        showArrowsOnHover: false,
        side: "left",
        className: "left-6",
      },
      {
        showArrowsOnHover: true,
        side: "right",
        className: "-right-12 group-hover:right-6",
      },
      {
        showArrowsOnHover: false,
        side: "right",
        className: "right-6",
      },
    ],
  },
);

export interface SlideshowArrowsProps extends VariantProps<typeof variants> {
  arrowsIcon: "caret" | "arrow";
  iconSize: number;
  showArrowsOnHover: boolean;
}

export function Arrows(props: SlideshowArrowsProps) {
  let { arrowsIcon, iconSize, arrowsColor, showArrowsOnHover, arrowsShape } =
    props;
  let [canNext, setCanNext] = useState(true);
  let [canPrev, setCanPrev] = useState(true);
  let swiper = useSwiper();

  if (!swiper.params.loop) {
    swiper.on("init", ({ activeIndex, slides }) => {
      setCanNext(activeIndex < slides.length - 1);
      setCanPrev(activeIndex > 0);
    });
    swiper.on("activeIndexChange", ({ activeIndex, slides }) => {
      setCanNext(activeIndex < slides.length - 1);
      setCanPrev(activeIndex > 0);
    });
  }

  return (
    <>
      <button
        type="button"
        className={clsx(
          "slideshow-arrow-prev",
          variants({
            arrowsColor,
            arrowsShape,
            showArrowsOnHover,
            disabled: !canPrev,
            side: "left",
          }),
        )}
        disabled={!canPrev}
      >
        {arrowsIcon === "caret" ? (
          <CaretLeft style={{ width: iconSize, height: iconSize }} />
        ) : (
          <ArrowLeft style={{ width: iconSize, height: iconSize }} />
        )}
      </button>
      <button
        type="button"
        className={clsx(
          "slideshow-arrow-next",
          variants({
            arrowsColor,
            arrowsShape,
            showArrowsOnHover,
            disabled: !canNext,
            side: "right",
          }),
        )}
        disabled={!canNext}
      >
        {arrowsIcon === "caret" ? (
          <CaretRight style={{ width: iconSize, height: iconSize }} />
        ) : (
          <ArrowRight style={{ width: iconSize, height: iconSize }} />
        )}
      </button>
    </>
  );
}
