import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import { useState } from "react";
import { useSwiper } from "swiper/react";

const variants = cva(
  [
    "hidden md:block",
    "-translate-y-1/2 absolute top-1/2 z-1",
    "cursor-pointer p-2 text-center",
    "border border-transparent",
    "transition-all duration-200",
  ],
  {
    variants: {
      arrowsColor: {
        light: "bg-white text-gray-900 hover:bg-gray-100",
        dark: "bg-gray-900 text-gray-100 hover:bg-gray-800",
      },
      arrowsShape: {
        square: "",
        rounded: "rounded-md",
        circle: "rounded-full",
      },
      disabled: {
        true: "cursor-not-allowed opacity-75",
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
  const { arrowsIcon, iconSize, arrowsColor, showArrowsOnHover, arrowsShape } =
    props;
  const [canNext, setCanNext] = useState(true);
  const [canPrev, setCanPrev] = useState(true);
  const swiper = useSwiper();

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
          <CaretLeftIcon style={{ width: iconSize, height: iconSize }} />
        ) : (
          <ArrowLeftIcon style={{ width: iconSize, height: iconSize }} />
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
          <CaretRightIcon style={{ width: iconSize, height: iconSize }} />
        ) : (
          <ArrowRightIcon style={{ width: iconSize, height: iconSize }} />
        )}
      </button>
    </>
  );
}
