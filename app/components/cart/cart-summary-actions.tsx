import { XIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import { CartForm } from "@shopify/hydrogen";
import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { Banner } from "~/components/banner";
import { Button } from "~/components/button";
import { cn } from "~/utils/cn";

export function NoteDialog({ cartNote: currentNote }: { cartNote: string }) {
  const [note, setNote] = useState(currentNote);
  const [submitted, setSubmitted] = useState(false);
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      setSubmitted(true);
    }
  }, [fetcher]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formCartNote = formData.get("cartNote") as string;
    if (formCartNote) {
      fetcher.submit(
        {
          [CartForm.INPUT_NAME]: JSON.stringify({
            action: CartForm.ACTIONS.NoteUpdate,
            inputs: { cartNote: formCartNote },
          }),
        },
        { method: "POST", action: "/cart" },
      );
      setNote(formCartNote);
    }
  }

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-gray-900/50 data-[state=open]:animate-fade-in" />
      <Dialog.Content
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          setNote(currentNote);
          setSubmitted(false);
        }}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs",
          "[--slide-up-from:20px]",
          "data-[state=open]:animate-slide-up",
        )}
        aria-describedby={undefined}
      >
        <div className="relative w-full max-w-md overflow-hidden bg-white p-6 shadow-xl">
          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur transition-colors hover:bg-gray-100 focus-visible:outline-0"
              aria-label="Close"
            >
              <XIcon size={16} />
            </button>
          </Dialog.Close>

          <Dialog.Title className="mb-4 font-medium text-lg">
            Add a note
          </Dialog.Title>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <textarea
              className="min-h-20 w-full resize-none p-3"
              placeholder="Add any special instructions or notes for your order..."
              rows={4}
              name="cartNote"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setSubmitted(false);
              }}
            />
            {submitted && (
              <Banner variant="success">Cart note saved successfully 🎉</Banner>
            )}
            <div className="flex items-center justify-end gap-3">
              <Dialog.Close asChild>
                <Button variant="custom" className="w-24 border-none">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                loading={fetcher.state !== "idle"}
                disabled={fetcher.state !== "idle"}
                className="w-24 leading-tight! [--spinner-duration:400ms]"
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

export function DiscountDialog({
  discountCodes = [],
}: {
  discountCodes: CartApiQueryFragment["discountCodes"];
}) {
  const [code, setCode] = useState("");
  const fetcher = useFetcher();
  const submitted = Boolean(code && fetcher.state === "idle" && fetcher.data);
  const success = Boolean(
    submitted && discountCodes?.find((d) => d.code === code && d.applicable),
  );
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
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          setCode("");
          fetcher.data = null;
        }}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs",
          "[--slide-up-from:20px]",
          "data-[state=open]:animate-slide-up",
        )}
        aria-describedby={undefined}
      >
        <div className="relative w-full max-w-md overflow-hidden bg-white p-6 shadow-xl">
          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur transition-colors hover:bg-gray-100 focus-visible:outline-0"
              aria-label="Close"
            >
              <XIcon size={16} />
            </button>
          </Dialog.Close>

          <Dialog.Title className="mb-4 font-medium text-xl">
            Apply a discount code
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                fetcher.data = null;
              }}
              className="w-full p-3"
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
              <Dialog.Close asChild>
                <Button variant="custom" className="w-24 border-none">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                className="w-24 leading-tight! [--spinner-duration:400ms]"
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

export function GiftCardDialog({
  appliedGiftCards = [],
}: {
  appliedGiftCards: CartApiQueryFragment["appliedGiftCards"];
}) {
  const appliedGiftCardCodes = useRef<string[]>([]);
  const [code, setCode] = useState("");
  const fetcher = useFetcher();
  const submitted = Boolean(code && fetcher.state === "idle" && fetcher.data);
  const success = Boolean(
    submitted &&
      appliedGiftCards?.find((gc) =>
        code.toLowerCase().endsWith(gc.lastCharacters),
      ),
  );
  const error = submitted && !success;

  function saveAppliedCode(gcCode: string) {
    const formattedCode = gcCode.replace(/\s/g, ""); // Remove spaces
    if (!appliedGiftCardCodes.current.includes(formattedCode)) {
      appliedGiftCardCodes.current.push(formattedCode);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const giftCardCode = formData.get("giftCardCode") as string;
    if (giftCardCode) {
      fetcher.submit(
        {
          [CartForm.INPUT_NAME]: JSON.stringify({
            action: CartForm.ACTIONS.GiftCardCodesUpdate,
            inputs: {
              giftCardCode,
              giftCardCodes: appliedGiftCardCodes.current,
            },
          }),
        },
        { method: "POST", action: "/cart" },
      );
      saveAppliedCode(giftCardCode);
    }
  }

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-gray-900/50 data-[state=open]:animate-fade-in" />
      <Dialog.Content
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          setCode("");
          fetcher.data = null;
        }}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs",
          "[--slide-up-from:20px]",
          "data-[state=open]:animate-slide-up",
        )}
        aria-describedby={undefined}
      >
        <div className="relative w-full max-w-md overflow-hidden bg-white p-6 shadow-xl">
          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur transition-colors hover:bg-gray-100 focus-visible:outline-0"
              aria-label="Close"
            >
              <XIcon size={16} />
            </button>
          </Dialog.Close>

          <Dialog.Title className="mb-4 font-medium text-xl">
            Redeem a gift card
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full p-3"
              type="text"
              name="giftCardCode"
              placeholder="Gift card code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                fetcher.data = null;
              }}
              required
            />
            {success && (
              <Banner variant="success">
                Gift card applied successfully 🎉
              </Banner>
            )}
            {error && <Banner variant="error">Invalid gift card code.</Banner>}
            <div className="flex items-center justify-end gap-3">
              <Dialog.Close asChild>
                <Button variant="custom" className="w-24 border-none">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                className="w-24 leading-tight! [--spinner-duration:400ms]"
                loading={fetcher.state !== "idle"}
                disabled={fetcher.state !== "idle"}
              >
                Redeem
              </Button>
            </div>
          </form>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
