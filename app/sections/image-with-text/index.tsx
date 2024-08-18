import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { backgroundInputs } from "~/components/background-image";
import type { SectionProps } from "~/components/section";
import { Section, layoutInputs } from "~/components/section";

type ImageWithTextProps = SectionProps;

let ImageWithText = forwardRef<HTMLElement, ImageWithTextProps>(
  (props, ref) => {
    let { children, ...rest } = props;

    return (
      <Section
        ref={ref}
        {...rest}
        containerClassName="flex flex-col md:flex-row px-0 sm:px-0"
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
  inspector: [
    {
      group: "Layout",
      inputs: layoutInputs.filter(({ name }) => name !== "gap"),
    },
    { group: "Background", inputs: backgroundInputs },
  ],
  childTypes: ["image-with-text--content", "image-with-text--image"],
  presets: {
    verticalPadding: "none",
    children: [
      { type: "image-with-text--image" },
      { type: "image-with-text--content" },
    ],
  },
};
