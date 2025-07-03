import { XIcon } from "@phosphor-icons/react";
import {
  Close,
  Content,
  type DialogCloseProps,
  type DialogContentProps,
  type DialogProps,
  type DialogTriggerProps,
  Overlay,
  Portal,
  Root,
  Trigger,
} from "@radix-ui/react-dialog";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "~/utils/cn";

export const Modal: React.FC<DialogProps> = Root;

export const ModalTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ asChild = true, ...rest }, ref) => {
    return <Trigger asChild={asChild} {...rest} ref={ref} />;
  },
);

interface ModalContentProps extends DialogContentProps {}

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <Portal>
        <Overlay className="fixed inset-0 z-10" />
        <Content
          {...rest}
          ref={ref}
          className={cn(
            "data-[state='open']:animate-slide-up",
            "fixed inset-0 z-10 flex items-center overflow-x-hidden bg-gray-900/50 px-4",
          )}
        >
          <div
            style={{ maxHeight: "90vh" }}
            className={cn(
              "relative animate-slide-up overflow-hidden",
              "mx-auto h-auto w-full max-w-(--breakpoint-xl)",
            )}
          >
            <ModalClose />
            <div className={cn("bg-white p-6 shadow-sm", className)}>
              {children}
            </div>
          </div>
        </Content>
      </Portal>
    );
  },
);

export const ModalClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ asChild, children, ...rest }, ref) => {
    return (
      <Close asChild {...rest} ref={ref}>
        {asChild ? (
          children
        ) : (
          <XIcon className="absolute top-3 right-3 cursor-pointer" size={20} />
        )}
      </Close>
    );
  },
);
