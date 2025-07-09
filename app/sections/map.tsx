import { createSchema } from "@weaverse/hydrogen";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import { forwardRef } from "react";
import Heading from "~/components/heading";
import Link, {
  type LinkProps,
  type LinkStyles,
  linkStylesInputs,
} from "~/components/link";
import Paragraph from "~/components/paragraph";
import type { SectionProps } from "~/components/section";
import { Section } from "~/components/section";

const variants = cva("", {
  variants: {
    alignment: {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    },
    height: {
      small: "min-h-[40vh]",
      medium: "min-h-[50vh]",
      large: "min-h-[60vh]",
    },
  },
});

interface MapSectionProps
  extends Omit<SectionProps, "backgroundColor">,
    VariantProps<typeof variants>,
    LinkStyles {
  address: string;
  heading: string;
  description: string;
  alignment: "left" | "center" | "right";
  buttonVariant: LinkProps["variant"];
  buttonText: LinkProps["children"];
  boxBgColor: string;
  boxTextColor: string;
  boxBorderRadius: number;
}

const MapSection = forwardRef<HTMLElement, MapSectionProps>((props, ref) => {
  const {
    height,
    alignment,
    heading,
    description,
    address,
    boxBgColor,
    boxTextColor,
    boxBorderRadius,
    buttonText,
    buttonVariant,
    backgroundColor,
    textColor,
    borderColor,
    backgroundColorHover,
    textColorHover,
    borderColorHover,
    ...rest
  } = props;

  return (
    <Section
      ref={ref}
      {...rest}
      containerClassName={clsx(
        "flex items-start p-6 md:p-12",
        variants({ height, alignment }),
      )}
    >
      <iframe
        className="absolute inset-0 z-[-1] h-full w-full object-cover"
        title="Google map embedded frame"
        src={`https://maps.google.com/maps?t=m&q=${address}&ie=UTF8&&output=embed`}
      />
      <div
        className="w-80 max-w-full space-y-3 p-8 shadow-2xl md:space-y-6"
        style={{
          backgroundColor: boxBgColor,
          color: boxTextColor,
          borderRadius: `${boxBorderRadius}px`,
        }}
      >
        {heading && <Heading content={heading} as="h6" alignment="left" />}
        {address && <Paragraph content={address} />}
        {description && <Paragraph content={description} />}
        {buttonText && (
          <Link
            to={`https://www.google.com/maps/search/${address}`}
            openInNewTab
            variant={buttonVariant}
            backgroundColor={backgroundColor}
            textColor={textColor}
            borderColor={borderColor}
            backgroundColorHover={backgroundColorHover}
            textColorHover={textColorHover}
            borderColorHover={borderColorHover}
          >
            {buttonText}
          </Link>
        )}
      </div>
    </Section>
  );
});

export default MapSection;

export const schema = createSchema({
  type: "map",
  title: "Map",
  settings: [
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
            ],
          },
          defaultValue: "small",
        },
        {
          type: "toggle-group",
          name: "alignment",
          label: "Content alignment",
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
    {
      group: "Address box",
      inputs: [
        {
          type: "text",
          name: "address",
          label: "Address",
          defaultValue: "301 Front St W, Toronto, ON M5V 2T6, Canada",
        },
        {
          type: "text",
          name: "heading",
          label: "Heading",
          defaultValue: "Our store address",
        },
        {
          type: "richtext",
          label: "Description",
          name: "description",
          defaultValue:
            "<p>Mon - Fri, 8:30am - 10:30pm</p><p>Saturday, 8:30am - 10:30pm</p><p>Sunday, 8:30am - 10:30pm</p>",
        },
        {
          type: "color",
          name: "boxBgColor",
          label: "Background color",
          defaultValue: "#fff",
        },
        {
          type: "color",
          name: "boxTextColor",
          label: "Text color",
        },
        {
          type: "range",
          name: "boxBorderRadius",
          label: "Border radius",
          configs: {
            min: 0,
            max: 40,
            step: 2,
            unit: "px",
          },
          defaultValue: 0,
        },
        {
          type: "heading",
          label: "Direction button (optional)",
        },
        {
          type: "text",
          name: "buttonText",
          label: "Button text",
          defaultValue: "Get directions",
          placeholder: "Get directions",
        },
        {
          type: "select",
          name: "variant",
          label: "Variant",
          configs: {
            options: [
              { label: "Primary", value: "primary" },
              { label: "Secondary", value: "secondary" },
              { label: "Outline", value: "outline" },
              { label: "Link", value: "link" },
              { label: "Custom styles", value: "custom" },
            ],
          },
          defaultValue: "primary",
        },
        ...linkStylesInputs,
      ],
    },
  ],
});
