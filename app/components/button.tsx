import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { Icon } from "~/components/icon";
import { ScrollReveal } from "~/components/scroll-reveal";
import { cn } from "~/utils/cn";

export const variants = cva(
  [
    "relative inline-flex items-center justify-center rounded-md",
    "text-base font-normal whitespace-nowrap",
    "focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50!",
    "transition-colors",
  ],
  {
    variants: {
      variant: {
        primary: [
          "border px-4 py-3 font-semibold",
          "text-(--btn-primary-text)",
          "bg-(--btn-primary-bg)",
          "border-(--btn-primary-bg)",
          "hover:bg-(--btn-primary-bg-hover)",
          "hover:border-(--btn-primary-bg-hover)",
        ],
        secondary: [
          "border px-4 py-3 font-semibold",
          "text-(--btn-secondary-text)",
          "bg-(--btn-secondary-bg)",
          "border-(--btn-secondary-bg)",
          "hover:bg-(--btn-secondary-bg-hover)",
          "hover:border-(--btn-secondary-bg-hover)",
        ],
        outline: [
          "border px-4 py-3 font-semibold",
          "text-(--btn-outline-text)",
          "bg-transparent",
          "border-(--btn-outline-text)",
          "hover:bg-(--btn-outline-bg-hover)",
        ],
        custom: [
          "border px-4 py-3 font-semibold",
          "text-(--btn-text)",
          "bg-(--btn-bg)",
          "border-(--btn-border)",
          "hover:text-(--btn-text-hover)",
          "hover:bg-(--btn-bg-hover)",
          "hover:border-(--btn-border-hover)",
        ],
        underline: [
          "text-body bg-transparent pb-1",
          "after:bg-body after:absolute after:bottom-0.5 after:left-0 after:h-px after:w-full",
          "after:origin-right after:scale-x-100 after:transition-transform",
          "hover:after:animate-underline-toggle hover:after:origin-left",
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
  extends
    VariantProps<typeof variants>,
    Omit<HTMLAttributes<HTMLButtonElement>, "type">,
    Partial<ButtonStyleProps> {
  type?: "button" | "reset" | "submit";
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  animate?: boolean;
}

export function Button(props: ButtonProps) {
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
    return (
      <ScrollReveal
        as="button"
        style={style}
        type={type}
        {...rest}
        className={cn(variants({ variant, className }))}
      >
        {loading && <Spinner />}
        {content}
      </ScrollReveal>
    );
  }

  return (
    <button
      style={style}
      type={type}
      {...rest}
      className={cn(variants({ variant, className }))}
    >
      {loading && <Spinner />}
      {content}
    </button>
  );
}

function Spinner() {
  return (
    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [&~*]:invisible">
      <Icon
        name="circle-notch"
        className="h-5 w-5 animate-spin [animation-duration:var(--spinner-duration,500ms)]"
      />
    </span>
  );
}
