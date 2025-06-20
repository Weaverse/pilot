import {
  createSchema,
  type HydrogenComponentProps,
  type WeaverseImage,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import { forwardRef } from "react";
import { Image } from "~/components/image";

const variants = cva("h-(--image-height)", {
  variants: {
    columnSpan: {
      1: "col-span-1",
      2: "col-span-2",
      3: "col-span-3",
      4: "col-span-4",
    },
    borderRadius: {
      0: "",
      2: "rounded-xs",
      4: "rounded-sm",
      6: "rounded-md",
      8: "rounded-lg",
      10: "rounded-[10px]",
      12: "rounded-xl",
      14: "rounded-[14px]",
      16: "rounded-2xl",
      18: "rounded-[18px]",
      20: "rounded-[20px]",
      22: "rounded-[22px]",
      24: "rounded-3xl",
    },
    hideOnMobile: {
      true: "hidden sm:block",
      false: "",
    },
  },
  defaultVariants: {
    columnSpan: 1,
    borderRadius: 8,
    hideOnMobile: false,
  },
});

interface ImageGalleryItemProps
  extends VariantProps<typeof variants>,
    HydrogenComponentProps {
  src: WeaverseImage;
}

const ImageGalleryItem = forwardRef<HTMLImageElement, ImageGalleryItemProps>(
  (props, ref) => {
    const { src, columnSpan, borderRadius, hideOnMobile, ...rest } = props;
    const data = typeof src === "object" ? src : { url: src, altText: src };
    return (
      <Image
        ref={ref}
        {...rest}
        className={clsx(variants({ columnSpan, borderRadius, hideOnMobile }))}
        data-motion="slide-in"
        loading="lazy"
        data={data}
        width={1000}
        sizes="(min-width: 45em) 50vw, 100vw"
      />
    );
  },
);

export default ImageGalleryItem;

export const schema = createSchema({
  type: "image-gallery--item",
  title: "Image",
  settings: [
    {
      group: "Image gallery item",
      inputs: [
        {
          type: "image",
          name: "src",
          label: "Image",
          defaultValue:
            "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/h2-placeholder-image.svg",
        },
        {
          type: "range",
          label: "Column span",
          name: "columnSpan",
          configs: {
            min: 1,
            max: 4,
            step: 1,
          },
          defaultValue: 1,
        },
        {
          type: "range",
          label: "Border radius",
          name: "borderRadius",
          configs: {
            min: 0,
            max: 24,
            step: 2,
            unit: "px",
          },
          defaultValue: 0,
        },
        {
          type: "switch",
          label: "Hide on mobile",
          name: "hideOnMobile",
          defaultValue: false,
        },
      ],
    },
  ],
});
