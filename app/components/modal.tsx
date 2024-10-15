import { X } from "@phosphor-icons/react";
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
import { cn } from "~/lib/cn";

export let Modal: React.FC<DialogProps> = Root;

export let ModalTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ asChild = true, ...rest }, ref) => {
    return <Trigger asChild={asChild} {...rest} ref={ref} />;
  }
);

interface ModalContentProps extends DialogContentProps {}

export let ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <Portal>
        <Overlay className="fixed inset-0 z-10" />
        <Content
          {...rest}
          ref={ref}
          className={cn(
            "data-[state='open']:animate-slide-down-and-fade",
            "fixed inset-0 z-10 flex items-center overflow-x-hidden bg-gray-900/50 px-4"
          )}
        >
          <div
            style={{ maxHeight: "90vh" }}
            className={cn(
              "animate-slide-down-and-fade relative overflow-hidden",
              "w-full mx-auto h-auto max-w-screen-xl"
            )}
          >
            <ModalClose />
            <div className={cn("bg-white shadow p-6", className)}>
              {children}
            </div>
          </div>
        </Content>
      </Portal>
    );
  }
);

export let ModalClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ asChild, children, ...rest }, ref) => {
    return (
      <Close asChild {...rest} ref={ref}>
        {asChild ? (
          children
        ) : (
          <X className="absolute right-3 top-3 cursor-pointer" size={20} />
        )}
      </Close>
    );
  }
);
