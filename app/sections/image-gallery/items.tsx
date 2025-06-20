import {
  createSchema,
  type HydrogenComponentProps,
  IMAGES_PLACEHOLDERS,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { CSSProperties } from "react";
import { forwardRef } from "react";

const variants = cva("flex flex-col sm:grid sm:grid-cols-4", {
  variants: {
    gap: {
      0: "",
      4: "gap-1",
      8: "gap-2",
      12: "gap-3",
      16: "gap-4",
      20: "gap-5",
      24: "gap-3 lg:gap-6",
      28: "gap-3.5 lg:gap-7",
      32: "gap-4 lg:gap-8",
      36: "gap-4 lg:gap-9",
      40: "gap-5 lg:gap-10",
      44: "gap-5 lg:gap-11",
      48: "gap-6 lg:gap-12",
      52: "gap-6 lg:gap-[52px]",
      56: "gap-7 lg:gap-14",
      60: "gap-7 lg:gap-[60px]",
    },
  },
});

interface ImageGalleyItemsProps
  extends HydrogenComponentProps,
    VariantProps<typeof variants> {
  height: number;
}

const ImageGalleyItems = forwardRef<HTMLDivElement, ImageGalleyItemsProps>(
  (props, ref) => {
    const { children, gap, height, ...rest } = props;

    return (
      <div
        ref={ref}
        {...rest}
        className={variants({ gap })}
        style={{ "--image-height": `${height}px` } as CSSProperties}
      >
        {children}
      </div>
    );
  },
);

export default ImageGalleyItems;

export const schema = createSchema({
  type: "image-gallery--items",
  title: "Images",
  settings: [
    {
      group: "Images",
      inputs: [
        {
          type: "range",
          label: "Images gap",
          name: "gap",
          configs: {
            min: 16,
            max: 40,
            step: 6,
            unit: "px",
          },
          defaultValue: 16,
        },
        {
          type: "range",
          label: "Images height",
          name: "height",
          configs: {
            min: 250,
            max: 400,
            step: 2,
            unit: "px",
          },
          defaultValue: 288,
        },
      ],
    },
  ],
  childTypes: ["image-gallery--item"],
  presets: {
    children: [
      {
        type: "image-gallery--item",
        columnSpan: 2,
        src: IMAGES_PLACEHOLDERS.banner_1,
        hideOnMobile: true,
      },
      {
        type: "image-gallery--item",
        src: IMAGES_PLACEHOLDERS.product_1,
      },
      {
        type: "image-gallery--item",
        hideOnMobile: true,
        src: IMAGES_PLACEHOLDERS.product_2,
      },
      {
        type: "image-gallery--item",
        hideOnMobile: true,
        src: IMAGES_PLACEHOLDERS.product_3,
      },
      {
        type: "image-gallery--item",
        src: IMAGES_PLACEHOLDERS.product_4,
      },
      {
        type: "image-gallery--item",
        columnSpan: 2,
        src: IMAGES_PLACEHOLDERS.banner_2,
        hideOnMobile: true,
      },
    ],
  },
});
