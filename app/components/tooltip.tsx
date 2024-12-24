import type {
  TooltipContentProps,
  TooltipProps,
  TooltipTriggerProps,
} from "@radix-ui/react-tooltip";
import {
  Arrow,
  Content,
  Provider,
  Root,
  Trigger,
} from "@radix-ui/react-tooltip";
import { forwardRef } from "react";
import { cn } from "~/utils/cn";

export let TooltipProvider = Provider;
export let Tooltip = ({ delayDuration = 100, ...rest }: TooltipProps) => (
  <Root delayDuration={delayDuration} {...rest} />
);

export let TooltipTrigger = ({
  asChild = true,
  ...rest
}: TooltipTriggerProps) => <Trigger asChild={asChild} {...rest} />;

export let TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ children, className, sideOffset = 4, style, ...rest }, ref) => {
    return (
      <Content
        ref={ref}
        className={cn(
          "animate-slide-up",
          "z-50 px-3 py-1 shadow-sm text-background bg-body",
          className
        )}
        align="center"
        side="top"
        sideOffset={sideOffset}
        collisionPadding={8}
        style={
          {
            "--slide-up-from": "6px",
            "--slide-up-duration": "0.3s",
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <Arrow asChild>
          <span className="border-x-6 border-t-6 border-x-transparent border-t-body" />
        </Arrow>
        {children}
      </Content>
    );
  }
);
