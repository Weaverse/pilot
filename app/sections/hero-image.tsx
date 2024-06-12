import {
  IMAGES_PLACEHOLDERS,
  type HydrogenComponentSchema,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import { backgroundInputs } from "~/components/BackgroundImage";
import { overlayInputs } from "~/components/Overlay";
import type { SectionProps } from "~/components/Section";
import { Section, layoutInputs } from "~/components/Section";

export interface HeroImageProps extends VariantProps<typeof variants> {}

let variants = cva("flex flex-col [&_.paragraph]:mx-[unset]", {
  variants: {
    height: {
      small: "min-h-[40vh] lg:min-h-[50vh]",
      medium: "min-h-[50vh] lg:min-h-[60vh]",
      large: "min-h-[70vh] lg:min-h-[80vh]",
      full: "h-screen-no-nav",
    },
    contentPosition: {
      "top left": "justify-start items-start [&_.paragraph]:[text-align:left]",
      "top center":
        "justify-start items-center [&_.paragraph]:[text-align:center]",
      "top right": "justify-start items-end [&_.paragraph]:[text-align:right]",
      "center left":
        "justify-center items-start [&_.paragraph]:[text-align:left]",
      "center center":
        "justify-center items-center [&_.paragraph]:[text-align:center]",
      "center right":
        "justify-center items-end [&_.paragraph]:[text-align:right]",
      "bottom left": "justify-end items-start [&_.paragraph]:[text-align:left]",
      "bottom center":
        "justify-end items-center [&_.paragraph]:[text-align:center]",
      "bottom right": "justify-end items-end [&_.paragraph]:[text-align:right]",
    },
  },
  defaultVariants: {
    height: "large",
    contentPosition: "center center",
  },
});

let HeroImage = forwardRef<HTMLElement, HeroImageProps & SectionProps>(
  (props, ref) => {
    let { children, height, contentPosition, ...rest } = props;
    return (
      <Section
        ref={ref}
        {...rest}
        containerClassName={variants({ contentPosition, height })}
      >
        {children}
      </Section>
    );
  },
);

export default HeroImage;

export let schema: HydrogenComponentSchema = {
  type: "hero-image",
  title: "Hero image",
  toolbar: ["general-settings", ["duplicate", "delete"]],
  inspector: [
    {
      group: "Layout",
      inputs: [
        {
          type: "select",
          name: "height",
          label: "Section height",
          configs: {
            options: [
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
              { value: "full", label: "Fullscreen" },
            ],
          },
        },
        {
          type: "position",
          name: "contentPosition",
          label: "Content position",
          defaultValue: "center center",
        },
        ...layoutInputs.filter(
          (inp) => inp.name !== "divider" && inp.name !== "borderRadius",
        ),
      ],
    },
    {
      group: "Background",
      inputs: [
        ...backgroundInputs.filter(
          (inp) =>
            inp.name !== "backgroundFor" && inp.name !== "backgroundColor",
        ),
      ],
    },
    { group: "Overlay", inputs: overlayInputs },
  ],
  childTypes: ["subheading", "heading", "paragraph", "button"],
  presets: {
    height: "large",
    contentPosition: "bottom left",
    backgroundImage: IMAGES_PLACEHOLDERS.backgroundImage,
    backgroundFit: "cover",
    enableOverlay: true,
    overlayOpacity: 35,
    children: [
      {
        type: "subheading",
        content: "Subheading",
        color: "#ffffff",
      },
      {
        type: "heading",
        content: "Hero image with text overlay",
        color: "#ffffff",
        size: "scale",
        minSize: 16,
        maxSize: 56,
      },
      {
        type: "paragraph",
        content:
          "Use this text to share information about your brand with your customers. Describe a product, share announcements, or welcome customers to your store.",
        color: "#ffffff",
      },
    ],
  },
};
