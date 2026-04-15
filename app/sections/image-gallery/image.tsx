import {
  createSchema,
  type HydrogenComponentProps,
  type WeaverseImage,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import { Image } from "~/components/image";
import { ScrollReveal } from "~/components/scroll-reveal";

const variants = cva("h-(--image-height) rounded-md", {
  variants: {
    columnSpan: {
      1: "col-span-1",
      2: "col-span-2",
      3: "col-span-3",
      4: "col-span-4",
    },
    hideOnMobile: {
      true: "hidden sm:block",
      false: "",
    },
  },
  defaultVariants: {
    columnSpan: 1,
    hideOnMobile: false,
  },
});

interface ImageGalleryItemProps
  extends VariantProps<typeof variants>,
    HydrogenComponentProps {
  src: WeaverseImage;
}

function ImageGalleryItem(props: ImageGalleryItemProps) {
  const { src, columnSpan, hideOnMobile, ...rest } = props;
  const data = typeof src === "object" ? src : { url: src, altText: src };
  return (
    <ScrollReveal
      animation="slide-in"
      {...rest}
      className={clsx(variants({ columnSpan, hideOnMobile }))}
    >
      <Image
        loading="lazy"
        data={data}
        width={1000}
        sizes="(min-width: 45em) 50vw, 100vw"
      />
    </ScrollReveal>
  );
}

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
          type: "switch",
          label: "Hide on mobile",
          name: "hideOnMobile",
          defaultValue: false,
        },
      ],
    },
  ],
});
