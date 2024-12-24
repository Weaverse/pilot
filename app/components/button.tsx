import { CircleNotch } from "@phosphor-icons/react";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "~/utils/cn";

export let variants = cva(
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
          "text-[--btn-primary-text]",
          "bg-[--btn-primary-bg]",
          "border-[--btn-primary-bg]",
          "hover:text-[--btn-primary-bg]",
          "hover:bg-[--btn-primary-text]",
          "hover:border-[--btn-primary-bg]",
        ],
        secondary: [
          "border px-4 py-3",
          "text-[--btn-secondary-text]",
          "bg-[--btn-secondary-bg]",
          "border-[--btn-secondary-bg]",
          "hover:bg-[--btn-secondary-text]",
          "hover:text-[--btn-secondary-bg]",
          "hover:border-[--btn-secondary-text]",
        ],
        outline: [
          "border px-4 py-3",
          "text-[--btn-outline-text]",
          "bg-transparent",
          "border-[--btn-outline-text]",
          "hover:bg-[--btn-outline-text]",
          "hover:text-background",
          "hover:border-[--btn-outline-text]",
        ],
        custom: [
          "border px-4 py-3",
          "text-[--btn-text]",
          "bg-[--btn-bg]",
          "border-[--btn-border]",
          "hover:text-[--btn-text-hover]",
          "hover:bg-[--btn-bg-hover]",
          "hover:border-[--btn-border-hover]",
        ],
        underline: [
          "bg-transparent pb-1 text-body",
          "after:bg-body after:absolute after:left-0 after:bottom-0.5 after:w-full after:h-px",
          "after:scale-x-100 after:transition-transform after:origin-right",
          "hover:after:origin-left hover:after:animate-underline-toggle",
        ],
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
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
    Omit<HTMLAttributes<HTMLButtonElement>, "type">,
    Partial<ButtonStyleProps> {
  type?: "button" | "reset" | "submit";
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  animate?: boolean;
}

export let Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  let {
    type = "button",
    variant,
    loading,
    className,
    textColor,
    backgroundColor,
    borderColor,
    textColorHover,
    backgroundColorHover,
    borderColorHover,
    style = {},
    animate = true,
    children,
    ...rest
  } = props;
  if (variant === "custom") {
    style = {
      ...style,
      "--btn-text": textColor,
      "--btn-bg": backgroundColor,
      "--btn-border": borderColor,
      "--btn-text-hover": textColorHover,
      "--btn-bg-hover": backgroundColorHover,
      "--btn-border-hover": borderColorHover,
    } as React.CSSProperties;
  }

  if (!children) {
    return null;
  }

  let content: React.ReactNode;
  if (typeof children === "string") {
    content = <span>{children}</span>;
  } else {
    content = children;
  }

  if (animate) {
    rest["data-motion"] = "fade-up";
  }

  return (
    <button
      ref={ref}
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
      <CircleNotch className="animate-spin w-5 h-5" />
    </span>
  );
}
