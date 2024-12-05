import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "~/lib/cn";

export function DialogDemo({
  width = "400px",
  openFrom,
}: { width?: string; openFrom: "left" | "right" }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="inline-flex h-[35px] items-center justify-center rounded bg-white px-[15px] font-medium leading-none text-violet11 shadow-[0_2px_10px] shadow-blackA4 hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none">
          Edit profile
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 bg-black/50 data-[state=open]:animate-fade-in z-10"
          style={{ "--fade-in-duration": "100ms" } as React.CSSProperties}
        />
        <Dialog.Content
          className={cn([
            "fixed inset-y-0 w-[--drawer-width] bg-[--color-background] p-4 z-10",
            openFrom === "left" &&
              "left-0 -translate-x-full data-[state=open]:animate-enter-from-left",
            openFrom === "right" &&
              "right-0 translate-x-full data-[state=open]:animate-enter-from-right",
          ])}
          style={
            {
              "--drawer-width": width,
            } as React.CSSProperties
          }
        >
          content goes here
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
