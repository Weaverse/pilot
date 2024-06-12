import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { forwardRef } from "react";

export interface ParagraphProps
  extends VariantProps<typeof variants>,
    Partial<HydrogenComponentProps> {
  as?: "p" | "div";
  content: string;
  color?: string;
}

let variants = cva("paragraph", {
  variants: {
    width: {
      full: "w-full mx-auto",
      narrow: "w-full md:w-1/2 lg:w-3/4 max-w-4xl mx-auto",
    },
    alignment: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    width: "full",
  },
});

let Paragraph = forwardRef<
  HTMLParagraphElement | HTMLDivElement,
  ParagraphProps
>((props, ref) => {
  let {
    as: Tag = "p",
    width,
    content,
    color,
    alignment,
    className,
    ...rest
  } = props;
  return (
    <Tag
      ref={ref}
      {...rest}
      style={{ color }}
      className={clsx(variants({ width, alignment, className }))}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
});

export default Paragraph;

export let schema: HydrogenComponentSchema = {
  type: "paragraph",
  title: "Paragraph",
  inspector: [
    {
      group: "Paragraph",
      inputs: [
        {
          type: "select",
          name: "as",
          label: "HTML tag",
          configs: {
            options: [
              { value: "p", label: "Paragraph" },
              { value: "div", label: "Div" },
            ],
          },
          defaultValue: "p",
        },
        {
          type: "richtext",
          name: "content",
          label: "Content",
          defaultValue:
            "Pair large text with an image or full-width video to showcase your brand's lifestyle to describe and showcase an important detail of your products that you can tag on your image.",
          placeholder:
            "Pair large text with an image or full-width video to showcase your brand's lifestyle to describe and showcase an important detail of your products that you can tag on your image.",
        },
        {
          type: "color",
          name: "color",
          label: "Text color",
        },
        {
          type: "toggle-group",
          name: "width",
          label: "Width",
          configs: {
            options: [
              { value: "full", label: "Full", icon: "move-horizontal" },
              {
                value: "narrow",
                label: "Narrow",
                icon: "fold-horizontal",
              },
            ],
          },
          defaultValue: "narrow",
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
  toolbar: ["general-settings", ["duplicate", "delete"]],
};
