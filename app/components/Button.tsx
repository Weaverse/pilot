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
import { IconCircleNotch } from "./icons";
import { Link } from "./link";

let variants = cva(
  [
    "inline-flex items-center justify-center rounded-none relative",
    "text-base leading-tight font-normal whitespace-nowrap",
    "focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
    "transition-colors",
  ],
  {
    variants: {
      variant: {
        primary: [
          "border px-4 py-3",
          "text-[var(--color-button-primary-text)]",
          "bg-[var(--color-button-primary-bg)]",
          "border-[var(--color-button-primary-bg)]",
          "hover:bg-[var(--color-button-primary-text)]",
          "hover:text-[var(--color-button-primary-bg)]",
          "hover:border-[var(--color-button-primary-bg)]",
        ],
        secondary: [
          "border px-4 py-3",
          "text-[var(--color-button-secondary-text)]",
          "bg-[var(--color-button-secondary-bg)]",
          "border-[var(--color-button-secondary-bg)]",
          "hover:bg-[var(--color-button-secondary-text)]",
          "hover:text-[var(--color-button-secondary-bg)]",
          "hover:border-[var(--color-button-secondary-text)]",
        ],
        outline: [
          "border px-4 py-3",
          "text-[var(--color-button-outline-text-and-border)]",
          "bg-transparent",
          "border-[var(--color-button-outline-text-and-border)]",
          "hover:bg-[var(--color-button-outline-text-and-border)]",
          "hover:text-background",
          "hover:border-[var(--color-button-outline-text-and-border)]",
        ],
        custom: [
          "border px-4 py-3",
          "text-[var(--color-button-text)]",
          "bg-[var(--color-button-bg)]",
          "border-[var(--color-button-border)]",
          "hover:bg-[var(--color-button-bg-hover)]",
          "hover:text-[var(--color-button-text-hover)]",
          "hover:border-[var(--color-button-border-hover)]",
        ],
        link: [
          "bg-transparent pb-1 text-body",
          "after:bg-body after:absolute after:left-0 after:bottom-0.5 after:w-full after:h-px",
          "after:scale-x-100 after:transition-transform after:origin-right",
          "hover:after:origin-left hover:after:animate-underline",
        ],
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export interface ButtonStyleProps {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  backgroundColorHover: string;
  textColorHover: string;
  borderColorHover: string;
}

export interface ButtonProps
  extends VariantProps<typeof variants>,
    Omit<HTMLAttributes<HTMLAnchorElement | HTMLButtonElement>, "type">,
    Partial<Omit<HydrogenComponentProps, "children">>,
    Partial<ButtonStyleProps> {
  type?: "button" | "reset" | "submit";
  className?: string;
  text?: string;
  link?: string;
  openInNewTab?: boolean;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

let Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  let {
    type = "button",
    variant,
    text,
    link,
    loading,
    openInNewTab,
    className,
    backgroundColor,
    textColor,
    borderColor,
    backgroundColorHover,
    textColorHover,
    borderColorHover,
    style = {},
    children,
    ...rest
  } = props;
  if (variant === "custom") {
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

  if (!text && !children) {
    return null;
  }

  let content: React.ReactNode;
  if (text) {
    content = <span>{text}</span>;
  } else if (typeof children === "string") {
    content = <span>{children}</span>;
  } else {
    content = children;
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
        {loading && <Spinner />}
        {content}
      </Link>
    );
  }
  return (
    <button
      ref={ref as React.ForwardedRef<HTMLButtonElement>}
      style={style}
      type={type}
      {...rest}
      className={cn(variants({ variant, className }))}
    >
      {loading && <Spinner />}
      {content}
    </button>
  );
});

function Spinner() {
  let style = { "--duration": "500ms" } as React.CSSProperties;
  return (
    <span
      className="button-spinner absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={style}
    >
      <IconCircleNotch className="animate-spin w-5 h-5" />
    </span>
  );
}

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
        { label: "Outline", value: "outline" },
        { label: "Link", value: "link" },
        { label: "Custom styles", value: "custom" },
      ],
    },
    defaultValue: "primary",
  },
];
export let buttonStylesInputs: InspectorGroup["inputs"] = [
  {
    type: "color",
    label: "Background color",
    name: "backgroundColor",
    defaultValue: "#000",
    condition: "variant.eq.custom",
  },
  {
    type: "color",
    label: "Text color",
    name: "textColor",
    defaultValue: "#fff",
    condition: "variant.eq.custom",
  },
  {
    type: "color",
    label: "Border color",
    name: "borderColor",
    defaultValue: "#00000000",
    condition: "variant.eq.custom",
  },
  {
    type: "color",
    label: "Background color (hover)",
    name: "backgroundColorHover",
    defaultValue: "#00000000",
    condition: "variant.eq.custom",
  },
  {
    type: "color",
    label: "Text color (hover)",
    name: "textColorHover",
    defaultValue: "#000",
    condition: "variant.eq.custom",
  },
  {
    type: "color",
    label: "Border color (hover)",
    name: "borderColorHover",
    defaultValue: "#000",
    condition: "variant.eq.custom",
  },
];

export let buttonInputs: InspectorGroup["inputs"] = [
  ...buttonContentInputs,
  {
    type: "heading",
    label: "Button custom styles",
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
