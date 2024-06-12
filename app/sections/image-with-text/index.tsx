import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { backgroundInputs } from "~/components/BackgroundImage";
import { overlayInputs } from "~/components/Overlay";
import type { SectionProps } from "~/components/Section";
import { Section, layoutInputs } from "~/components/Section";

type ImageWithTextProps = SectionProps;

let ImageWithText = forwardRef<HTMLElement, ImageWithTextProps>(
  (props, ref) => {
    let { children, ...rest } = props;

    return (
      <Section
        ref={ref}
        {...rest}
        containerClassName="flex flex-col md:flex-row"
      >
        {children}
      </Section>
    );
  },
);

export default ImageWithText;

export let schema: HydrogenComponentSchema = {
  type: "image-with-text",
  title: "Image with text",
  toolbar: ["general-settings", ["duplicate", "delete"]],
  inspector: [
    {
      group: "Layout",
      inputs: layoutInputs.filter(({ name }) => name !== "gap"),
    },
    { group: "Background", inputs: backgroundInputs },
    { group: "Overlay", inputs: overlayInputs },
  ],
  childTypes: ["image-with-text--content", "image-with-text--image"],
  presets: {
    children: [
      { type: "image-with-text--image" },
      { type: "image-with-text--content" },
    ],
  },
};
