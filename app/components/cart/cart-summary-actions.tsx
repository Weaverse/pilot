import { XIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import { CartForm } from "@shopify/hydrogen";
import { useRef, useState } from "react";
import { useFetcher } from "react-router";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { Banner } from "~/components/banner";
import { Button } from "~/components/button";
import { cn } from "~/utils/cn";

export function CartSummaryActions({
  discountCodes,
  cartNote,
}: {
  discountCodes: CartApiQueryFragment["discountCodes"];
  cartNote: string;
}) {
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);

  return (
    <div className="flex items-center justify-end gap-2">
      <Dialog.Root open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <Dialog.Trigger asChild>
          <Button variant="underline">Add a note</Button>
        </Dialog.Trigger>
        <NoteDialog cartNote={cartNote} onOpenChange={setNoteDialogOpen} />
      </Dialog.Root>
      <span>/</span>
      <Dialog.Root
        open={discountDialogOpen}
        onOpenChange={setDiscountDialogOpen}
      >
        <Dialog.Trigger asChild>
          <Button variant="underline">Apply a discount</Button>
        </Dialog.Trigger>
        <DiscountDialog
          discountCodes={discountCodes}
          onOpenChange={setDiscountDialogOpen}
        />
      </Dialog.Root>
    </div>
  );
}

function NoteDialog({
  onOpenChange,
  cartNote: currentNote,
}: {
  onOpenChange: (open: boolean) => void;
  cartNote: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fetcher = useFetcher();
  const cartNote = textareaRef.current?.value || "";
  const submitted = cartNote && fetcher.state === "idle" && fetcher.data;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const note = formData.get("cartNote") as string;
    if (note) {
      fetcher.submit(
        {
          [CartForm.INPUT_NAME]: JSON.stringify({
            action: "CustomCartNoteUpdate",
            inputs: { cartNote: note },
          }),
        },
        { method: "POST", action: "/cart" },
      );
    }
  }

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-gray-900/50 data-[state=open]:animate-fade-in" />
      <Dialog.Content
        onCloseAutoFocus={(e) => e.preventDefault()}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs",
          "[--slide-up-from:20px]",
          "data-[state=open]:animate-slide-up",
        )}
        aria-describedby={undefined}
      >
        <div className="relative w-full max-w-md overflow-hidden bg-white shadow-xl p-6">
          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur transition-colors hover:bg-gray-100 focus-visible:outline-0"
              aria-label="Close"
            >
              <XIcon size={16} />
            </button>
          </Dialog.Close>

          <Dialog.Title className="font-medium text-lg mb-4">
            Add a note
          </Dialog.Title>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <textarea
              ref={textareaRef}
              className="w-full p-3 min-h-20 resize-none"
              placeholder="Add any special instructions or notes for your order..."
              rows={4}
              name="cartNote"
              defaultValue={currentNote}
            />
            {submitted && (
              <Banner variant="success">Cart note saved successfully 🎉</Banner>
            )}
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="custom"
                onClick={() => onOpenChange(false)}
                className="w-24 border-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={fetcher.state !== "idle"}
                disabled={fetcher.state !== "idle"}
                className="leading-tight! w-24 [--spinner-duration:400ms]"
              >
                Save note
              </Button>
            </div>
          </form>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

function DiscountDialog({
  discountCodes = [],
  onOpenChange,
}: {
  discountCodes: CartApiQueryFragment["discountCodes"];
  onOpenChange: (open: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher();
  const code = inputRef.current?.value || "";
  const submitted = code && fetcher.state === "idle" && fetcher.data;
  const success =
    submitted && discountCodes?.find((d) => d.code === code && d.applicable);
  const error = submitted && !success;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const discountCode = formData.get("discountCode") as string;
    if (discountCode) {
      fetcher.submit(
        {
          [CartForm.INPUT_NAME]: JSON.stringify({
            action: CartForm.ACTIONS.DiscountCodesUpdate,
            inputs: {
              discountCode,
              discountCodes: discountCodes.map((d) => d.code),
            },
          }),
        },
        { method: "POST", action: "/cart" },
      );
    }
  }

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-gray-900/50 data-[state=open]:animate-fade-in" />
      <Dialog.Content
        onCloseAutoFocus={(e) => e.preventDefault()}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs",
          "[--slide-up-from:20px]",
          "data-[state=open]:animate-slide-up",
        )}
        aria-describedby={undefined}
      >
        <div className="relative w-full max-w-md overflow-hidden bg-white shadow-xl p-6">
          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur transition-colors hover:bg-gray-100 focus-visible:outline-0"
              aria-label="Close"
            >
              <XIcon size={16} />
            </button>
          </Dialog.Close>

          <Dialog.Title className="font-medium text-xl mb-4">
            Apply a discount code
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              ref={inputRef}
              className="p-3 w-full"
              type="text"
              name="discountCode"
              placeholder="Discount code"
              required
            />
            {success && (
              <Banner variant="success">
                Discount applied successfully 🎉
              </Banner>
            )}
            {error && <Banner variant="error">Invalid discount code.</Banner>}
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="custom"
                onClick={() => {
                  onOpenChange(false);
                }}
                className="w-24 border-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="leading-tight! w-24 [--spinner-duration:400ms]"
                loading={fetcher.state !== "idle"}
                disabled={fetcher.state !== "idle"}
              >
                Apply
              </Button>
            </div>
          </form>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
