import type { ScrollAreaProps as RadixScrollAreaProps } from "@radix-ui/react-scroll-area";
import { Root, Scrollbar, Thumb, Viewport } from "@radix-ui/react-scroll-area";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/utils/cn";

const variants = cva("", {
  variants: {
    size: {
      sm: "data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-1",
      md: "data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:w-1.5",
      lg: "data-[orientation=horizontal]:h-2 data-[orientation=vertical]:w-2",
      xl: "data-[orientation=horizontal]:h-3 data-[orientation=vertical]:w-3",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface ScrollAreaProps
  extends RadixScrollAreaProps,
    VariantProps<typeof variants> {
  ref?: React.Ref<HTMLDivElement>;
  style?: React.CSSProperties;
  rootClassName?: string;
  scrollbarClassName?: string;
  thumbClassName?: string;
}

export function ScrollArea({
  ref,
  size,
  rootClassName,
  className,
  scrollbarClassName,
  thumbClassName,
  children,
  style,
  ...rest
}: ScrollAreaProps) {
  return (
    <Root {...rest} ref={ref} className={cn("overflow-hidden", rootClassName)}>
      <Viewport
        style={style}
        className={cn("relative h-full w-full", className)}
      >
        {children}
      </Viewport>
      <Scrollbar
        className={cn(
          "flex touch-none select-none data-[orientation=horizontal]:flex-col",
          "bg-black/10 dark:bg-gray-700/50",
          "transition-colors duration-150 ease-out",
          variants({ size }),
          scrollbarClassName,
        )}
        orientation="vertical"
      >
        <Thumb
          className={cn(
            "relative flex-1 shadow-intense",
            "bg-gray-500 dark:bg-gray-500",
            "before:-translate-x-1/2 before:-translate-y-1/2 before:absolute before:top-1/2 before:left-1/2 before:content-['']",
            "before:h-full before:min-h-5 before:w-full before:min-w-5",
            thumbClassName,
          )}
        />
      </Scrollbar>
    </Root>
  );
}
