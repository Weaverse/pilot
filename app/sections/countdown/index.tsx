import {
  type HydrogenComponentSchema,
  IMAGES_PLACEHOLDERS,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import { backgroundInputs } from "~/components/background-image";
import { overlayInputs } from "~/components/overlay";
import type { SectionProps } from "~/components/section";
import { Section } from "~/components/section";

let variants = cva("flex flex-col [&_.paragraph]:mx-[unset] px-4 sm:px-16", {
  variants: {
    alignment: {
      left: "items-start [&_.paragraph]:[text-align:left] [&_.countdown--timer]:-ml-4",
      center: "items-center [&_.paragraph]:[text-align:center]",
      right:
        "items-end [&_.paragraph]:[text-align:right] [&_.countdown--timer]:-mr-4",
    },
  },
});

interface CountdownProps extends VariantProps<typeof variants>, SectionProps {}

let Countdown = forwardRef<HTMLElement, CountdownProps>((props, ref) => {
  let { children, alignment, ...rest } = props;
  return (
    <Section ref={ref} {...rest} containerClassName={variants({ alignment })}>
      {children}
    </Section>
  );
});

export default Countdown;

export let schema: HydrogenComponentSchema = {
  type: "countdown",
  title: "Countdown",
  inspector: [
    {
      group: "Layout",
      inputs: [
        {
          type: "select",
          name: "width",
          label: "Content width",
          configs: {
            options: [
              { value: "full", label: "Full page" },
              { value: "stretch", label: "Stretch" },
              { value: "fixed", label: "Fixed" },
            ],
          },
          defaultValue: "fixed",
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
        {
          type: "range",
          name: "gap",
          label: "Items spacing",
          configs: {
            min: 0,
            max: 60,
            step: 4,
            unit: "px",
          },
          defaultValue: 20,
        },
        {
          type: "select",
          name: "verticalPadding",
          label: "Vertical padding",
          configs: {
            options: [
              { value: "none", label: "None" },
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
            ],
          },
          defaultValue: "medium",
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
      ],
    },
    { group: "Background", inputs: backgroundInputs },
    { group: "Overlay", inputs: overlayInputs },
  ],
  childTypes: ["heading", "subheading", "countdown--timer", "button"],
  presets: {
    backgroundImage: IMAGES_PLACEHOLDERS.banner_2,
    width: "stretch",
    enableOverlay: true,
    overlayOpacity: 40,
    verticalPadding: "large",
    children: [
      {
        type: "heading",
        content: "Sale ends in",
        color: "white",
      },
      {
        type: "paragraph",
        content: "Use this timer to create urgency and boost sales.",
        width: "full",
        color: "white",
      },
      {
        type: "countdown--timer",
        textColor: "white",
      },
      {
        type: "button",
        text: "Shop now",
        variant: "custom",
        backgroundColor: "#00000000",
        textColor: "#fff",
        borderColor: "#fff",
        backgroundColorHover: "#fff",
        textColorHover: "#000",
        borderColorHover: "#fff",
      },
    ],
  },
};
