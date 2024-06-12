import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  InspectorGroup,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "~/lib/cn";
import { Link } from "~/modules";

let variants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-base font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "btn-primary border-2 px-5 py-3",
        secondary: "btn-secondary border-2 px-5 py-3",
        link: "btn-link bg-transparent py-2 border-b-2",
      },
      shape: {
        square: "",
        rounded: "rounded-md",
        pill: "rounded-full",
      },
      weight: {
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
      },
    },
    defaultVariants: {
      variant: "primary",
      shape: "rounded",
      weight: "medium",
    },
  },
);

export interface ButtonProps
  extends VariantProps<typeof variants>,
    Omit<HTMLAttributes<HTMLAnchorElement | HTMLButtonElement>, "children">,
    Partial<HydrogenComponentProps> {
  as?: keyof HTMLElementTagNameMap;
  className?: string;
  text: string;
  link?: string;
  openInNewTab?: boolean;
  buttonStyle?: "inherit" | "custom";
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  backgroundColorHover?: string;
  textColorHover?: string;
  borderColorHover?: string;
}

let Button = forwardRef<HTMLElement, ButtonProps>((props, ref) => {
  let {
    // as = "button",
    variant,
    // shape = "rounded",
    // weight = "medium",
    text,
    link,
    openInNewTab,
    className,
    buttonStyle,
    backgroundColor,
    textColor,
    borderColor,
    backgroundColorHover,
    textColorHover,
    borderColorHover,
    style = {},
    ...rest
  } = props;
  if (buttonStyle === "custom") {
    style = {
      ...style,
      "--color-button-bg": backgroundColor,
      "--color-button-text": textColor,
      "--color-button-border": borderColor,
      "--color-button-bg-hover": backgroundColorHover,
      "--color-button-text-hover": textColorHover,
      "--color-button-border-hover": borderColorHover,
    } as React.CSSProperties;
  }

  if (link) {
    return (
      <Link
        ref={ref as React.ForwardedRef<HTMLAnchorElement>}
        style={style}
        {...rest}
        className={cn(variants({ variant, className }))}
        to={link || "/"}
        target={openInNewTab ? "_blank" : "_self"}
        rel="noreferrer"
      >
        {text}
      </Link>
    );
  }
  return (
    <button
      ref={ref as React.ForwardedRef<HTMLButtonElement>}
      style={style}
      {...rest}
      type="button"
      className={cn(variants({ variant, className }))}
    >
      {text}
    </button>
  );
});

export default Button;

export let buttonContentInputs: InspectorGroup["inputs"] = [
  {
    type: "text",
    name: "text",
    label: "Text content",
    defaultValue: "Shop now",
    placeholder: "Shop now",
  },
  {
    type: "url",
    name: "link",
    label: "Link to",
    defaultValue: "/products",
    placeholder: "/products",
  },
  {
    type: "switch",
    name: "openInNewTab",
    label: "Open in new tab",
    defaultValue: false,
    condition: "buttonLink.ne.nil",
  },
  {
    type: "select",
    name: "variant",
    label: "Variant",
    configs: {
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Link", value: "link" },
      ],
    },
    defaultValue: "primary",
  },
];
export let buttonStylesInputs: InspectorGroup["inputs"] = [
  {
    type: "heading",
    label: "Button styles",
  },
  {
    type: "select",
    name: "buttonStyle",
    label: "Button style",
    configs: {
      options: [
        { label: "Inherit", value: "inherit" },
        { label: "Custom", value: "custom" },
      ],
    },
    defaultValue: "inherit",
    helpText:
      "Use 'Inherit' for theme-based styles, or 'Custom' to modify button appearance.",
  },
  {
    type: "color",
    label: "Background color",
    name: "backgroundColor",
    defaultValue: "#000",
    condition: "buttonStyle.eq.custom",
  },
  {
    type: "color",
    label: "Text color",
    name: "textColor",
    defaultValue: "#fff",
    condition: "buttonStyle.eq.custom",
  },
  {
    type: "color",
    label: "Border color",
    name: "borderColor",
    defaultValue: "#00000000",
    condition: "buttonStyle.eq.custom",
  },
  {
    type: "color",
    label: "Background color (hover)",
    name: "backgroundColorHover",
    defaultValue: "#00000000",
    condition: "buttonStyle.eq.custom",
  },
  {
    type: "color",
    label: "Text color (hover)",
    name: "textColorHover",
    defaultValue: "#000",
    condition: "buttonStyle.eq.custom",
  },
  {
    type: "color",
    label: "Border color (hover)",
    name: "borderColorHover",
    defaultValue: "#000",
    condition: "buttonStyle.eq.custom",
  },
];

export let buttonInputs: InspectorGroup["inputs"] = [
  ...buttonContentInputs,
  ...buttonStylesInputs,
];

export let schema: HydrogenComponentSchema = {
  type: "button",
  title: "Button",
  inspector: [
    {
      group: "Button",
      inputs: buttonInputs,
    },
  ],
  toolbar: ["general-settings", ["duplicate", "delete"]],
};
