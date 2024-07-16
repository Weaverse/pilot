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
  [
    "inline-flex items-center justify-center rounded-none",
    "text-base leading-tight font-normal whitespace-nowrap",
    "focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
    "transition-colors",
  ],
  {
    variants: {
      variant: {
        primary: [
          "border px-4 py-3",
          "text-[var(--color-button-text,var(--button-primary-color))]",
          "bg-[var(--color-button-bg,var(--button-primary-bg))]",
          "border-[var(--color-button-border,var(--button-primary-border))]",
          "hover:bg-[var(--color-button-bg-hover,var(--button-primary-bg-hover))]",
          "hover:text-[var(--color-button-text-hover,var(--button-primary-color-hover))]",
          "hover:border-[var(--color-button-border-hover,var(--button-primary-border-hover))]",
        ],
        secondary: [
          "border px-4 py-3",
          "text-[var(--color-button-text,var(--button-secondary-color))]",
          "bg-[var(--color-button-bg,var(--button-secondary-bg))]",
          "border-[var(--color-button-border,var(--button-secondary-border))]",
          "hover:bg-[var(--color-button-bg-hover,var(--button-secondary-bg-hover))]",
          "hover:text-[var(--color-button-text-hover,var(--button-secondary-color-hover))]",
          "hover:border-[var(--color-button-border-hover,var(--button-secondary-border-hover))]",
        ],
        outline: [
          "border px-4 py-3",
          "text-[var(--color-button-text,var(--button-outline-color))]",
          "bg-[var(--color-button-bg,var(--button-outline-bg))]",
          "border-[var(--color-button-border,var(--button-outline-border))]",
          "hover:bg-[var(--color-button-bg-hover,var(--button-outline-bg-hover))]",
          "hover:text-[var(--color-button-text-hover,var(--button-outline-color-hover))]",
          "hover:border-[var(--color-button-border-hover,var(--button-outline-border-hover))]",
        ],
        link: [
          "bg-transparent py-2 border-b",
          "text-[var(--color-button-text,var(--button-link-color))]",
          "border-b-[var(--color-button-border,var(--button-link-color))]",
          "hover:text-[var(--color-button-text-hover,var(--button-link-color-hover))]",
          "hover:border-[var(--color-button-border-hover,var(--button-link-color-hover))]",
        ],
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export interface ButtonStyleProps {
  buttonStyle: "inherit" | "custom";
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  backgroundColorHover: string;
  textColorHover: string;
  borderColorHover: string;
}

export interface ButtonProps
  extends VariantProps<typeof variants>,
    Omit<
      HTMLAttributes<HTMLAnchorElement | HTMLButtonElement>,
      "children" | "type"
    >,
    Partial<HydrogenComponentProps>,
    Partial<ButtonStyleProps> {
  className?: string;
  text: string;
  link?: string;
  openInNewTab?: boolean;
}

let Button = forwardRef<HTMLElement, ButtonProps>((props, ref) => {
  let {
    variant,
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
        { label: "Outline", value: "outline" },
        { label: "Link", value: "link" },
      ],
    },
    defaultValue: "primary",
  },
];
export let buttonStylesInputs: InspectorGroup["inputs"] = [
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
  {
    type: "heading",
    label: "Button styles",
  },
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
};
