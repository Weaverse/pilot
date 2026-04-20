import { cva } from "class-variance-authority";

export const variants = cva(
  "absolute inset-0 z-10 mx-auto flex max-w-screen flex-col px-3 [&_.paragraph]:mx-[unset]",
  {
    variants: {
      gap: {
        0: "",
        4: "space-y-1",
        8: "space-y-2",
        12: "space-y-3",
        16: "space-y-4",
        20: "space-y-5",
        24: "space-y-3 lg:space-y-6",
        28: "space-y-3.5 lg:space-y-7",
        32: "space-y-4 lg:space-y-8",
        36: "space-y-4 lg:space-y-9",
        40: "space-y-5 lg:space-y-10",
        44: "space-y-5 lg:space-y-11",
        48: "space-y-6 lg:space-y-12",
        52: "space-y-6 lg:space-y-[52px]",
        56: "space-y-7 lg:space-y-14",
        60: "space-y-7 lg:space-y-[60px]",
      },
      width: {
        full: "w-full",
        stretch: "w-full px-3 md:px-10 lg:px-16",
        fixed: "w-full max-w-(--page-width) px-3 md:px-4 lg:px-6",
      },
      verticalPadding: {
        none: "",
        small: "py-4 md:py-6 lg:py-8",
        medium: "py-8 md:py-12 lg:py-16",
        large: "py-12 md:py-24 lg:py-32",
      },
      contentPosition: {
        "top left": "items-start justify-start [&_.paragraph]:text-left",
        "top center": "items-center justify-start [&_.paragraph]:text-center",
        "top right": "items-end justify-start [&_.paragraph]:text-right",
        "center left": "items-start justify-center [&_.paragraph]:text-left",
        "center center":
          "items-center justify-center [&_.paragraph]:text-center",
        "center right": "items-end justify-center [&_.paragraph]:text-right",
        "bottom left": "items-start justify-end [&_.paragraph]:text-left",
        "bottom center": "items-center justify-end [&_.paragraph]:text-center",
        "bottom right": "items-end justify-end [&_.paragraph]:text-right",
      },
    },
    defaultVariants: {
      gap: 20,
      contentPosition: "center center",
    },
  },
);
