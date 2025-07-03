import {
  createSchema,
  type HydrogenComponentProps,
  IMAGES_PLACEHOLDERS,
  type WeaverseImage,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import { Image } from "~/components/image";
import type { ImageAspectRatio } from "~/types/image";
import { cn } from "~/utils/cn";

const variants = cva("h-auto w-full", {
  variants: {
    width: {
      small: "md:w-[40%]",
      medium: "md:w-[50%]",
      large: "md:w-[60%]",
    },
    objectFit: {
      cover: "object-cover",
      contain: "object-contain",
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
      26: "rounded-[26px]",
      28: "rounded-[28px]",
      30: "rounded-[30px]",
      32: "rounded-[32px]",
      34: "rounded-[34px]",
      36: "rounded-[36px]",
      38: "rounded-[38px]",
      40: "rounded-[40px]",
    },
  },
});

interface ImageWithTextImageProps
  extends VariantProps<typeof variants>,
    HydrogenComponentProps {
  image: WeaverseImage | string;
  imageAspectRatio: ImageAspectRatio;
}

const ImageWithTextImage = forwardRef<HTMLDivElement, ImageWithTextImageProps>(
  (props, ref) => {
    const {
      image = IMAGES_PLACEHOLDERS.image,
      width,
      imageAspectRatio,
      borderRadius,
      objectFit,
      ...rest
    } = props;
    const imageData: Partial<WeaverseImage> =
      typeof image === "string"
        ? { url: image, altText: "Placeholder" }
        : image;
    let aspRt: string | undefined;
    if (imageAspectRatio === "adapt") {
      if (imageData.width && imageData.height) {
        aspRt = `${imageData.width}/${imageData.height}`;
      }
    } else {
      aspRt = imageAspectRatio;
    }

    return (
      <div ref={ref} {...rest} className={cn(variants({ width }))}>
        <Image
          data={imageData}
          data-motion="slide-in"
          sizes="auto"
          aspectRatio={aspRt}
          className={cn("h-auto w-full", variants({ objectFit, borderRadius }))}
        />
      </div>
    );
  },
);

export default ImageWithTextImage;

export const schema = createSchema({
  type: "image-with-text--image",
  title: "Image",
  limit: 1,
  settings: [
    {
      group: "Image",
      inputs: [
        {
          type: "image",
          name: "image",
          label: "Image",
        },
        {
          type: "select",
          name: "imageAspectRatio",
          label: "Image aspect ratio",
          configs: {
            options: [
              { value: "adapt", label: "Adapt to image" },
              { value: "1/1", label: "Square (1/1)" },
              { value: "3/4", label: "Portrait (3/4)" },
              { value: "4/3", label: "Landscape (4/3)" },
              { value: "16/9", label: "Widescreen (16/9)" },
            ],
          },
          defaultValue: "1/1",
          helpText:
            'Learn more about image <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio" target="_blank" rel="noopener noreferrer">aspect ratio</a> property.',
        },
        {
          type: "select",
          name: "width",
          label: "Width",
          defaultValue: "medium",
          configs: {
            options: [
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
            ],
          },
        },
        {
          type: "range",
          name: "borderRadius",
          label: "Border radius",
          configs: {
            min: 0,
            max: 40,
            step: 2,
            unit: "px",
          },
          defaultValue: 0,
        },
        {
          type: "select",
          name: "objectFit",
          label: "Object fit",
          defaultValue: "cover",
          configs: {
            options: [
              { value: "cover", label: "Cover" },
              { value: "contain", label: "Contain" },
            ],
          },
        },
      ],
    },
  ],
  presets: {
    image: IMAGES_PLACEHOLDERS.image,
    width: "medium",
    aspectRatio: "1/1",
    objectFit: "cover",
    borderRadius: 0,
  },
});
