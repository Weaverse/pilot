import type { WeaverseImage } from "@weaverse/hydrogen";
import { createSchema, IMAGES_PLACEHOLDERS } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import Heading, {
  type HeadingProps,
  headingInputs,
} from "~/components/heading";
import { Image } from "~/components/image";
import Paragraph from "~/components/paragraph";
import type { SectionProps } from "~/components/section";
import { Section } from "~/components/section";
import type { ImageAspectRatio } from "~/types/image";
import { calculateAspectRatio } from "~/utils/image";

interface HotspotsProps
  extends Omit<SectionProps, "content">,
    Omit<HeadingProps, "as"> {
  description?: string;
  headingTagName?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  image: string;
  aspectRatio: ImageAspectRatio;
}

const Hotspots = forwardRef<HTMLElement, HotspotsProps>((props, ref) => {
  const {
    headingTagName,
    content,
    size,
    mobileSize,
    desktopSize,
    color,
    weight,
    letterSpacing,
    alignment,
    minSize,
    maxSize,
    description,
    image,
    aspectRatio,
    children,
    ...rest
  } = props;
  const imageData: Partial<WeaverseImage> =
    typeof image === "string"
      ? { url: image, altText: "Hotspots image" }
      : image;

  return (
    <Section ref={ref} {...rest} overflow="unset">
      {content && (
        <Heading
          content={content}
          as={headingTagName}
          color={color}
          size={size}
          mobileSize={mobileSize}
          desktopSize={desktopSize}
          minSize={minSize}
          maxSize={maxSize}
          weight={weight}
          letterSpacing={letterSpacing}
          alignment={alignment}
        />
      )}
      {description && (
        <Paragraph as="p" content={description} alignment="center" />
      )}
      <div
        className="relative"
        style={{ aspectRatio: calculateAspectRatio(imageData, aspectRatio) }}
      >
        <Image
          data={imageData}
          sizes="auto"
          className="z-0"
          data-motion="zoom-in"
        />
        {children}
      </div>
    </Section>
  );
});

export default Hotspots;

export const schema = createSchema({
  type: "hotspots",
  title: "Hotspots",
  childTypes: ["hotspots--item"],
  settings: [
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
          type: "image",
          name: "image",
          label: "Image",
        },
        {
          type: "select",
          name: "aspectRatio",
          label: "Aspect ratio",
          defaultValue: "adapt",
          configs: {
            options: [
              { value: "adapt", label: "Adapt to image" },
              { value: "1/1", label: "Square (1/1)" },
              { value: "3/4", label: "Portrait (3/4)" },
              { value: "4/3", label: "Landscape (4/3)" },
              { value: "16/9", label: "Widescreen (16/9)" },
            ],
          },
          helpText:
            'Learn more about image <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio" target="_blank" rel="noopener noreferrer">aspect ratio</a> property.',
        },
      ],
    },
    {
      group: "Heading (optional)",
      inputs: headingInputs.map((input) => {
        if (input.name === "as") {
          return {
            ...input,
            name: "headingTagName",
          };
        }
        return input;
      }),
    },
  ],
  presets: {
    content: "Shop the look",
    image: IMAGES_PLACEHOLDERS.collection_1,
    aspectRatio: "16/9",
    gap: 40,
    children: [
      {
        type: "hotspots--item",
        offsetX: 25,
        offsetY: 30,
      },
      {
        type: "hotspots--item",
        offsetX: 55,
        offsetY: 65,
      },
    ],
  },
});
