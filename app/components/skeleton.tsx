import { cn } from "~/utils/cn";

export function Skeleton({
  as: Component = "div",
  className,
  ...props
}: { as?: React.ElementType } & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component
      {...props}
      className={cn("animate-pulse bg-gray-200", className)}
    />
  );
}
