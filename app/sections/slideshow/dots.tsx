import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import clsx from "clsx";

export interface SlideshowDotsProps extends VariantProps<typeof variants> {
  dotsStyle?: "circle" | "line" | "dash";
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
        light: "[&_.dot]:bg-white",
        dark: "[&_.dot]:bg-black",
      },
      dotsStyle: {
        circle:
          "[&_.active]:outline-current [&_.active]:outline-2 [&_.active]:outline-solid [&_.active]:outline-offset-3",
        line: "[&_.active]:w-16 [&_.dot]:opacity-35 [&_.active]:opacity-100!",
        dash: "[&_.dot]:opacity-35 [&_.active]:opacity-100!",
      },
    },
    compoundVariants: [
      {
        dotsColor: "light",
        dotsStyle: "circle",
        className: "[&_.active]:outline-white!",
      },
      {
        dotsColor: "dark",
        dotsStyle: "circle",
        className: "[&_.active]:outline-black!",
      },
    ],
    defaultVariants: {
      dotsPosition: "bottom",
      dotsColor: "light",
      dotsStyle: "circle",
    },
  },
);

export function Dots(props: SlideshowDotsProps) {
  const { className, dotsPosition, dotsColor, dotsStyle } = props;
  return (
    <div
      className={clsx(
        variants({ dotsPosition, dotsColor, dotsStyle }),
        className,
      )}
    />
  );
}
