import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "~/utils/cn";

let variants = cva("subheading", {
  variants: {
    size: {
      base: "text-base",
      large: "text-lg",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
    },
    alignment: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    size: "base",
    weight: "normal",
    alignment: "center",
  },
});

interface SubHeadingProps
  extends VariantProps<typeof variants>,
    HydrogenComponentProps {
  as?: "h4" | "h5" | "h6" | "div" | "p";
  color?: string;
  content: string;
}

let SubHeading = forwardRef<
  HTMLHeadingElement | HTMLParagraphElement | HTMLDivElement,
  SubHeadingProps
>((props, ref) => {
  let {
    as: Tag = "p",
    content,
    color,
    size,
    weight,
    alignment,
    className,
    ...rest
  } = props;
  return (
    <Tag
      ref={ref}
      {...rest}
      data-motion="fade-up"
      style={{ color }}
      className={cn(variants({ size, weight, alignment, className }))}
    >
      {content}
    </Tag>
  );
});

export default SubHeading;

export let schema: HydrogenComponentSchema = {
  type: "subheading",
  title: "Subheading",
  inspector: [
    {
      group: "Subheading",
      inputs: [
        {
          type: "select",
          name: "as",
          label: "Tag name",
          configs: {
            options: [
              { value: "h4", label: "Heading 4" },
              { value: "h5", label: "Heading 5" },
              { value: "h6", label: "Heading 6" },
              { value: "p", label: "Paragraph" },
              { value: "div", label: "Div" },
            ],
          },
          defaultValue: "p",
        },
        {
          type: "text",
          name: "content",
          label: "Content",
          defaultValue: "Section subheading",
          placeholder: "Section subheading",
        },
        {
          type: "color",
          name: "color",
          label: "Text color",
        },
        {
          type: "select",
          name: "size",
          label: "Text size",
          configs: {
            options: [
              { value: "base", label: "Base" },
              { value: "large", label: "Large" },
            ],
          },
          defaultValue: "base",
        },
        {
          type: "select",
          name: "weight",
          label: "Weight",
          configs: {
            options: [
              { value: "normal", label: "Normal" },
              { value: "medium", label: "Medium" },
            ],
          },
          defaultValue: "normal",
        },
        {
          type: "toggle-group",
          name: "alignment",
          label: "Alignment",
          configs: {
            options: [
              { value: "left", label: "Left", icon: "align-start-vertical" },
              {
                value: "center",
                label: "Center",
                icon: "align-center-vertical",
              },
              { value: "right", label: "Right", icon: "align-end-vertical" },
            ],
          },
          defaultValue: "center",
        },
      ],
    },
  ],
};
