import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/utils/cn";

const variants = cva("w-full px-3 py-2 text-center", {
  variants: {
    variant: {
      info: "bg-gray-200 text-gray-800",
      error: "bg-red-200 text-red-700",
      success: "bg-green-200 text-green-700",
    },
  },
  defaultVariants: {
    variant: "info",
  },
});

export function Banner({
  as: Component = "div",
  children,
  variant,
  className,
  ...rest
}: {
  as?: React.ElementType;
  children: React.ReactNode;
} & VariantProps<typeof variants> &
  React.HTMLAttributes<HTMLElement>) {
  return (
    <Component className={cn(variants({ variant }), className)} {...rest}>
      {children}
    </Component>
  );
}
