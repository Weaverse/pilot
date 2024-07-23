import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from "@weaverse/hydrogen";
import { forwardRef } from "react";
import Button, {
  type ButtonStyleProps,
  buttonStylesInputs,
} from "~/components/Button";
import { Input } from "~/modules/Input";

interface NewsLetterInputProps
  extends HydrogenComponentProps,
    ButtonStyleProps {
  width: number;
  placeholder: string;
  gap: number;
  buttonText: string;
  buttonVariant: "link" | "primary" | "secondary" | "outline";
}

let NewsLetterInput = forwardRef<HTMLDivElement, NewsLetterInputProps>(
  (props, ref) => {
    let {
      buttonText,
      buttonVariant,
      buttonStyle,
      backgroundColor,
      textColor,
      borderColor,
      backgroundColorHover,
      textColorHover,
      borderColorHover,
      width,
      placeholder,
      gap,
      ...rest
    } = props;
    return (
      <div
        ref={ref}
        {...rest}
        style={{ gap }}
        className="flex flex-col md:flex-row max-w-[90%] items-center w-fit mx-auto"
      >
        <Input
          name="email"
          type="email"
          required
          placeholder={placeholder}
          style={{ width }}
        />
        <Button
          variant={buttonVariant}
          buttonStyle={buttonStyle}
          backgroundColor={backgroundColor}
          textColor={textColor}
          borderColor={borderColor}
          backgroundColorHover={backgroundColorHover}
          textColorHover={textColorHover}
          borderColorHover={borderColorHover}
        >
          {buttonText}
        </Button>
      </div>
    );
  },
);

export default NewsLetterInput;

export let schema: HydrogenComponentSchema = {
  type: "newsletter-input",
  title: "Input",
  inspector: [
    {
      group: "Input",
      inputs: [
        {
          type: "range",
          name: "gap",
          label: "Items gap",
          configs: {
            min: 20,
            max: 100,
            step: 4,
            unit: "px",
          },
          defaultValue: 20,
        },
        {
          type: "range",
          name: "width",
          label: "Input width",
          configs: {
            min: 250,
            max: 450,
            step: 10,
            unit: "px",
          },
          defaultValue: 300,
        },
        {
          type: "text",
          name: "placeholder",
          label: "Placeholder",
          defaultValue: "Enter your email",
          placeholder: "Enter your email",
        },
        {
          type: "heading",
          label: "Subscribe button",
        },
        {
          type: "text",
          name: "buttonText",
          label: "Button text",
          placeholder: "Subscribe",
          defaultValue: "Subscribe",
        },
        {
          type: "select",
          name: "buttonVariant",
          label: "Variant",
          configs: {
            options: [
              { label: "Primary", value: "primary" },
              { label: "Secondary", value: "secondary" },
              { label: "Outline", value: "outline" },
              { label: "Link", value: "link" },
            ],
          },
          defaultValue: "outline",
        },
        ...buttonStylesInputs,
      ],
    },
  ],
};
