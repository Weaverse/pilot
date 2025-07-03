import {
  createSchema,
  type HydrogenComponentProps,
  IMAGES_PLACEHOLDERS,
  type WeaverseImage,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { CSSProperties } from "react";
import { forwardRef } from "react";
import { Image } from "~/components/image";
import Link, { type LinkProps, linkContentInputs } from "~/components/link";
import type { ImageAspectRatio } from "~/types/image";
import { calculateAspectRatio } from "~/utils/image";

const variants = cva("", {
  variants: {
    size: {
      large: "col-span-6",
      medium: "col-span-4",
    },
    hideOnMobile: {
      true: "hidden sm:block",
      false: "",
    },
  },
});

interface ColumnWithImageItemProps
  extends VariantProps<typeof variants>,
    Pick<LinkProps, "variant" | "text" | "to" | "openInNewTab">,
    HydrogenComponentProps {
  imageSrc: WeaverseImage;
  imageAspectRatio: ImageAspectRatio;
  imageBorderRadius: number;
  heading: string;
  content: string;
}

const ColumnWithImageItem = forwardRef<
  HTMLDivElement,
  ColumnWithImageItemProps
>((props, ref) => {
  const {
    imageSrc,
    imageAspectRatio,
    imageBorderRadius,
    heading,
    content,
    text,
    to,
    variant,
    openInNewTab,
    hideOnMobile,
    size,
    ...rest
  } = props;

  return (
    <div
      ref={ref}
      {...rest}
      data-motion="slide-in"
      className={variants({ size, hideOnMobile })}
      style={{ "--radius": `${imageBorderRadius}px` } as CSSProperties}
    >
      <Image
        data={typeof imageSrc === "object" ? imageSrc : { url: imageSrc }}
        sizes="auto"
        className="h-auto rounded-(--radius)"
        aspectRatio={calculateAspectRatio(imageSrc, imageAspectRatio)}
      />
      <div className="mt-6 w-full space-y-3.5 text-center">
        {heading && <h6>{heading}</h6>}
        {content && <p dangerouslySetInnerHTML={{ __html: content }} />}
        {text && (
          <Link variant={variant} to={to} openInNewTab={openInNewTab}>
            {text}
          </Link>
        )}
      </div>
    </div>
  );
});

export default ColumnWithImageItem;

export const schema = createSchema({
  type: "column-with-image--item",
  title: "Column",
  settings: [
    {
      group: "Column",
      inputs: [
        {
          type: "select",
          name: "size",
          label: "Column size",
          configs: {
            options: [
              {
                label: "Large",
                value: "large",
              },
              {
                label: "Medium",
                value: "medium",
              },
            ],
          },
          defaultValue: "medium",
        },
        {
          type: "switch",
          label: "Hide on Mobile",
          name: "hideOnMobile",
          defaultValue: false,
        },
        {
          type: "heading",
          label: "Image",
        },
        {
          type: "image",
          name: "imageSrc",
          label: "Image",
        },
        {
          type: "select",
          name: "imageAspectRatio",
          label: "Image aspect ratio",
          defaultValue: "adapt",
          configs: {
            options: [
              { value: "adapt", label: "Adapt to image" },
              { value: "1/1", label: "Square (1/1)" },
              { value: "3/4", label: "Portrait (3/4)" },
              { value: "4/3", label: "Landscape (4/3)" },
              { value: "16/9", label: "Widescreen (16/9)" },
            ],
          },
          helpText:
            'Learn more about image <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio" target="_blank" rel="noopener noreferrer">aspect ratio</a> property.',
        },
        {
          type: "range",
          name: "imageBorderRadius",
          label: "Image border radius",
          configs: {
            min: 0,
            max: 40,
            step: 2,
            unit: "px",
          },
          defaultValue: 0,
        },
        {
          type: "heading",
          label: "Content",
        },
        {
          type: "text",
          name: "heading",
          label: "Heading",
          placeholder: "Example heading",
          defaultValue: "Example heading",
        },
        {
          type: "richtext",
          label: "Description",
          name: "content",
          placeholder:
            "Use this section to promote content throughout every page of your site. Add images for further impact.",
          defaultValue:
            "Use this section to promote content throughout every page of your site. Add images for further impact.",
        },

        {
          type: "heading",
          label: "Button (optional)",
        },
        ...linkContentInputs,
      ],
    },
  ],
  presets: {
    imageSrc: IMAGES_PLACEHOLDERS.product_4,
  },
});
