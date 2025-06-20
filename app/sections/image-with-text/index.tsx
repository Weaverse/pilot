import { createSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { backgroundInputs } from "~/components/background-image";
import type { SectionProps } from "~/components/section";
import { layoutInputs, Section } from "~/components/section";

type ImageWithTextProps = SectionProps;

const ImageWithText = forwardRef<HTMLElement, ImageWithTextProps>(
  (props, ref) => {
    const { children, ...rest } = props;

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

export const schema = createSchema({
  type: "image-with-text",
  title: "Image with text",
  settings: [
    {
      group: "Layout",
      inputs: layoutInputs.filter(({ name }) => name !== "gap"),
    },
    { group: "Background", inputs: backgroundInputs },
  ],
  childTypes: ["image-with-text--content", "image-with-text--image"],
  presets: {
    verticalPadding: "none",
    backgroundColor: "#dbe3d6",
    backgroundFor: "content",
    children: [
      { type: "image-with-text--image", aspectRatio: "1/1" },
      { type: "image-with-text--content" },
    ],
  },
});
