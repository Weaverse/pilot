import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseImage,
} from "@weaverse/hydrogen";
import type { CSSProperties } from "react";
import { forwardRef } from "react";
import { Image } from "@shopify/hydrogen";
import { Section, SectionProps } from "../shared/Section";

type CountdownData = {
  backgroundColor: string;
  backgroundImage: WeaverseImage;
  overlayColor: string;
  overlayOpacity: number;
  sectionHeight: number;
};

type CountdownProps = SectionProps & CountdownData;

let Countdown = forwardRef<HTMLElement, CountdownProps>((props, ref) => {
  let {
    backgroundColor,
    backgroundImage,
    overlayColor,
    overlayOpacity,
    sectionHeight,
    children,
    ...rest
  } = props;

  return (
    <Section ref={ref} {...rest}>
      {children}
    </Section>
  );
});

export default Countdown;

export let schema: HydrogenComponentSchema = {
  type: "countdown",
  title: "Countdown",
  toolbar: ["general-settings", ["duplicate", "delete"]],
  inspector: [
    {
      group: "Countdown",
      inputs: [
        {
          type: "color",
          name: "backgroundColor",
          label: "Background color",
          defaultValue: "#ffffff",
        },
        {
          type: "image",
          name: "backgroundImage",
          label: "Background image",
        },
        {
          type: "color",
          name: "overlayColor",
          label: "Overlay color",
        },
        {
          type: "range",
          name: "overlayOpacity",
          label: "Overlay opacity",
          defaultValue: 50,
          configs: {
            min: 10,
            max: 100,
            step: 10,
            unit: "%",
          },
        },
        {
          type: "range",
          name: "sectionHeight",
          label: "Section height",
          defaultValue: 450,
          configs: {
            min: 400,
            max: 700,
            step: 10,
            unit: "px",
          },
        },
      ],
    },
  ],
  childTypes: [
    "heading",
    "subheading",
    "countdown--timer",
    "countdown--actions",
  ],
  presets: {
    children: [
      {
        type: "heading",
        content: "Countdown heading",
      },
      {
        type: "subheading",
        content: "Countdown to our upcoming event",
      },
      {
        type: "countdown--timer",
      },
      {
        type: "countdown--actions",
      },
    ],
  },
};
