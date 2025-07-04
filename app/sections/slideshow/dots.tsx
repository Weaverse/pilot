import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import clsx from "clsx";

export interface SlideshowDotsProps extends VariantProps<typeof variants> {
  className?: string;
}

const variants = cva(
  [
    "slideshow-dots",
    "absolute z-1 flex w-auto! items-center justify-center gap-4 px-2.5",
  ],
  {
    variants: {
      dotsPosition: {
        top: "top-10! right-0! bottom-auto! left-0!",
        bottom: "top-auto! right-0! bottom-10! left-0!",
        left: "top-0! right-auto! bottom-0! left-5! flex-col",
        right: "top-0! right-5! bottom-0! left-auto! flex-col",
      },
      dotsColor: {
        light: "[&_.active]:outline-white! [&_.dot]:bg-white",
        dark: "[&_.active]:outline-black! [&_.dot]:bg-black",
      },
    },
    defaultVariants: {
      dotsPosition: "bottom",
      dotsColor: "light",
    },
  },
);

export function Dots(props: SlideshowDotsProps) {
  const { className, dotsPosition, dotsColor } = props;
  return (
    <div className={clsx(variants({ dotsPosition, dotsColor }), className)} />
  );
}
