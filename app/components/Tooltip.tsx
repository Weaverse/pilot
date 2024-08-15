import type {
  TooltipContentProps,
  TooltipProps,
  TooltipTriggerProps,
} from "@radix-ui/react-tooltip";
import {
  Content,
  Portal,
  Provider,
  Arrow,
  Root,
  Trigger,
} from "@radix-ui/react-tooltip";
import { forwardRef } from "react";
import { cn } from "~/lib/cn";

export let TooltipProvider = Provider;
export let Tooltip = ({ delayDuration = 100, ...rest }: TooltipProps) => (
  <Root delayDuration={delayDuration} {...rest} />
);

export let TooltipTrigger = ({
  asChild = true,
  ...rest
}: TooltipTriggerProps) => <Trigger asChild={asChild} {...rest} />;

export let TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ children, className, sideOffset = 4, ...rest }, ref) => {
    return (
      <Content
        ref={ref}
        className={cn(
          "animate-slideDownAndFade",
          "z-50 px-4 rounded py-1 shadow-sm text-background bg-body opacity-0",
          className,
        )}
        align="center"
        side="top"
        sideOffset={sideOffset}
        collisionPadding={8}
        {...rest}
      >
        <Arrow asChild>
          <span className="border-x-6 border-t-6 border-x-transparent border-t-body" />
        </Arrow>
        {children}
      </Content>
    );
  },
);
