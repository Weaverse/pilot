import {
  type HydrogenComponentSchema,
  IMAGES_PLACEHOLDERS,
  useThemeSettings,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import { backgroundInputs } from "~/components/background-image";
import { overlayInputs } from "~/components/overlay";
import type { SectionProps } from "~/components/section";
import { Section, layoutInputs } from "~/components/section";

export interface HeroImageProps extends VariantProps<typeof variants> {}

let variants = cva("flex flex-col [&_.paragraph]:mx-[unset]", {
  variants: {
    height: {
      small: "min-h-[40vh] lg:min-h-[50vh]",
      medium: "min-h-[50vh] lg:min-h-[60vh]",
      large: "min-h-[70vh] lg:min-h-[80vh]",
      full: "",
    },
    enableTransparentHeader: {
      true: "",
      false: "",
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
  compoundVariants: [
    {
      height: "full",
      enableTransparentHeader: true,
      className: "h-screen",
    },
    {
      height: "full",
      enableTransparentHeader: false,
      className: "h-screen-no-nav",
    },
  ],
  defaultVariants: {
    height: "large",
    contentPosition: "center center",
  },
});

let HeroImage = forwardRef<HTMLElement, HeroImageProps & SectionProps>(
  (props, ref) => {
    let { children, height, contentPosition, ...rest } = props;
    let { enableTransparentHeader } = useThemeSettings();
    return (
      <Section
        ref={ref}
        {...rest}
        containerClassName={variants({
          contentPosition,
          height,
          enableTransparentHeader,
        })}
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
    contentPosition: "center center",
    backgroundImage: IMAGES_PLACEHOLDERS.banner_1,
    backgroundFit: "cover",
    enableOverlay: true,
    overlayOpacity: 40,
    children: [
      {
        type: "subheading",
        content: "Subheading",
        color: "#ffffff",
      },
      {
        type: "heading",
        content: "Hero image with text overlay",
        as: "h2",
        color: "#ffffff",
        size: "default",
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
