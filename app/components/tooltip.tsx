import type {
  TooltipContentProps,
  TooltipProps,
  TooltipTriggerProps,
} from "@radix-ui/react-tooltip";
import {
  Arrow,
  Content,
  Portal,
  Provider,
  Root,
  Trigger,
} from "@radix-ui/react-tooltip";
import { cn } from "~/utils/cn";

export const TooltipProvider = Provider;
export const Tooltip = ({ delayDuration = 100, ...rest }: TooltipProps) => (
  <Root delayDuration={delayDuration} {...rest} />
);

export const TooltipTrigger = ({
  asChild = true,
  ...rest
}: TooltipTriggerProps) => <Trigger asChild={asChild} {...rest} />;

export function TooltipContent({
  ref,
  children,
  className,
  sideOffset = 4,
  style,
  ...rest
}: TooltipContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <Portal>
      <Content
        ref={ref}
        className={cn(
          "animate-slide-up [--slide-up-from:6px]",
          "z-1000 bg-body px-3 py-1 text-background text-sm shadow-xs",
          className,
        )}
        align="center"
        side="top"
        sideOffset={sideOffset}
        collisionPadding={8}
        {...rest}
      >
        <Arrow asChild>
          <span className="border-x-6 border-x-transparent border-t-6 border-t-body" />
        </Arrow>
        {children}
      </Content>
    </Portal>
  );
}
