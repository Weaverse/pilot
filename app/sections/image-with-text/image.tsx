import {
  createSchema,
  type HydrogenComponentProps,
  IMAGES_PLACEHOLDERS,
  type WeaverseImage,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { Image } from "~/components/image";
import { ScrollReveal } from "~/components/scroll-reveal";
import type { ImageAspectRatio } from "~/types/others";
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
  },
});

interface ImageWithTextImageProps
  extends VariantProps<typeof variants>,
    HydrogenComponentProps {
  image: WeaverseImage | string;
  imageAspectRatio: ImageAspectRatio;
  ref?: React.Ref<HTMLDivElement>;
}

function ImageWithTextImage(props: ImageWithTextImageProps) {
  const {
    image = IMAGES_PLACEHOLDERS.image,
    width,
    imageAspectRatio,
    objectFit,
    ref,
    ...rest
  } = props;
  const imageData: Partial<WeaverseImage> =
    typeof image === "string" ? { url: image, altText: "Placeholder" } : image;
  let aspRt: string | undefined;
  if (imageAspectRatio === "adapt") {
    if (imageData.width && imageData.height) {
      aspRt = `${imageData.width}/${imageData.height}`;
    }
  } else {
    aspRt = imageAspectRatio;
  }

  return (
    <div {...rest} className={cn(variants({ width }))}>
      <ScrollReveal animation="slide-in">
        <Image
          data={imageData}
          sizes="auto"
          aspectRatio={aspRt}
          className={cn("h-auto w-full rounded-md", variants({ objectFit }))}
        />
      </ScrollReveal>
    </div>
  );
}

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
  },
});
