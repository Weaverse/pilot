import type { ElementType } from "react";
import { cn } from "./utils/cn";

export function RevealUnderline({
  children,
  as: Component = "span",
  className,
}: {
  children: React.ReactNode;
  as?: ElementType;
  className?: string;
}) {
  return (
    <Component
      className={cn(
        [
          "[--underline-color:--color-text]",
          "pb-[3px]",
          "bg-[length:0%_1px]",
          "inline bg-no-repeat",
          "bg-[left_calc(1em+4px)]",
          "[transition:background_200ms_ease-in-out]",
          "hover:bg-[length:100%_1px]",
          "[background-image:linear-gradient(to_right,var(--underline-color),var(--underline-color))]",
        ],
        className,
      )}
    >
      {children}
    </Component>
  );
}
