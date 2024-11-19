import { Image } from "@shopify/hydrogen";
import {
  type HydrogenComponentProps,
  type HydrogenComponentSchema,
  IMAGES_PLACEHOLDERS,
  type WeaverseImage,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { CSSProperties } from "react";
import { forwardRef } from "react";
import Link, { linkContentInputs, type LinkProps } from "~/components/link";

let variants = cva("", {
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
  imageBorderRadius: number;
  heading: string;
  content: string;
}

let ColumnWithImageItem = forwardRef<HTMLDivElement, ColumnWithImageItemProps>(
  (props, ref) => {
    let {
      imageSrc,
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
        style={
          { "--image-border-radius": `${imageBorderRadius}px` } as CSSProperties
        }
      >
        <Image
          data={typeof imageSrc === "object" ? imageSrc : { url: imageSrc }}
          sizes="auto"
          className="aspect-square object-cover object-center w-full rounded-[var(--image-border-radius)]"
        />
        <div className="text-center w-full space-y-3.5 mt-6">
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
  },
);

export default ColumnWithImageItem;

export let schema: HydrogenComponentSchema = {
  type: "column-with-image--item",
  title: "Column",
  inspector: [
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
};
