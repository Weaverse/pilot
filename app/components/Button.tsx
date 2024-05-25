import type {
  InspectorGroup,
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { Link } from "~/modules";

export interface ButtonProps extends VariantProps<typeof variants> {
  as?: keyof HTMLElementTagNameMap;
  className?: string;
  text: string;
  link?: string;
  openInNewTab?: boolean;
  buttonStyle: "inherit" | "custom";
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  backgroundColorHover?: string;
  textColorHover?: string;
  borderColorHover?: string;
}

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

interface Props
  extends ButtonProps,
    Omit<HTMLAttributes<HTMLAnchorElement | HTMLButtonElement>, "children">,
    Partial<HydrogenComponentProps> {}

let Button = forwardRef<HTMLElement, Props>((props, ref) => {
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
        className={clsx(variants({ variant, className }))}
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
      className={clsx(variants({ variant, className }))}
    >
      {text}
    </button>
  );
});

export default Button;

export let buttonInputs: InspectorGroup["inputs"] = [
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
  {
    type: "heading",
    label: "Styles",
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
