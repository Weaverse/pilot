import { XIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { clsx } from "clsx";
import Link from "~/components/link";

export function OutletModal({
  children,
  cancelLink,
}: {
  children: React.ReactNode;
  cancelLink: string;
}) {
  return (
    <Dialog.Root defaultOpen>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-10 bg-black/50 data-[state=open]:animate-fade-in"
          style={{ "--fade-in-duration": "100ms" } as React.CSSProperties}
        />
        <Dialog.Content
          className={clsx([
            "fixed inset-0 z-10 w-screen p-4",
            "flex items-center justify-center",
            "data-[state=open]:animate-slide-up",
          ])}
          style={
            {
              "--slide-up-from": "20px",
              "--slide-up-duration": "300ms",
            } as React.CSSProperties
          }
          aria-describedby={undefined}
        >
          <div className="relative w-[500px] max-w-[90vw] bg-(--color-background) px-6 py-3">
            <VisuallyHidden.Root asChild>
              <Dialog.Title>Account modal</Dialog.Title>
            </VisuallyHidden.Root>
            {children}
            <Dialog.Close asChild>
              <Link
                to={cancelLink}
                className="absolute top-5 right-4 p-2"
                aria-label="Close account modal"
              >
                <XIcon className="h-4 w-4" />
              </Link>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
