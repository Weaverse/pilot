import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as React from "react";
import { cn } from "~/lib/cn";

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: React.ReactNode;
}

export let Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, label, ...props }, ref) => (
  <div className={cn("flex items-center gap-2.5", className)}>
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "w-5 h-5 shrink-0",
        "border border-line focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <span className="inline-block w-3 h-3 bg-body" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
    {label ? typeof label === "string" ? <span>{label}</span> : label : null}
  </div>
));
