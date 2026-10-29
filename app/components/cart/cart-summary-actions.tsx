import * as Dialog from "@radix-ui/react-dialog";
import { type FormEvent, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { Banner } from "~/components/banner";
import { Button, variants as buttonVariants } from "~/components/button";
import { Icon } from "~/components/icon";
import { ShopifyInboxOverlayGuard } from "~/components/shopify-inbox";
import { Spinner } from "~/components/spinner";
import { CART_GIFT_CARDS_PATH } from "~/utils/cart";
import { cn } from "~/utils/cn";
import { useCart, useCartActions, useCartForm } from "./cart-store";

type GiftCardsRequest =
  | { intent: "add"; giftCardCodes: string[] }
  | { intent: "remove"; appliedGiftCardIds: string[] };

/**
 * Applies or removes gift cards through Pilot's `/api/cart/gift-cards`
 * endpoint (Hydrogen's cart store has no gift card actions) and returns the
 * user errors; an empty list means the change was applied. The caller
 * refreshes the cart store afterwards.
 */
export async function postGiftCards(body: GiftCardsRequest) {
  try {
    const response = await fetch(CART_GIFT_CARDS_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json().catch(() => null)) as {
      userErrors?: { code?: string | null; message: string }[];
    } | null;
    if (response.ok && data) {
      return data.userErrors ?? [];
    }
  } catch {
    // Reported below like any other failed request.
  }
  return [{ code: null, message: "The gift card request failed." }];
}

/**
 * Follows one cart form submission through the store: `sent` until the store
 * reports the change as pending, then `done` once it settles.
 */
function useSubmissionPhase(pending: boolean) {
  const [phase, setPhase] = useState<"idle" | "sent" | "pending" | "done">(
    "idle",
  );
  useEffect(() => {
    if (phase === "sent" && pending) {
      setPhase("pending");
    } else if (phase === "pending" && !pending) {
      setPhase("done");
    }
  }, [phase, pending]);
  return [phase, setPhase] as const;
}

function DialogShell({
  title,
  titleClassName = "mb-4 text-xl font-medium",
  children,
}: {
  title: string;
  titleClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="data-[state=open]:animate-fade-in fixed inset-0 z-50 bg-gray-900/50" />
      <Dialog.Content
        onCloseAutoFocus={(e) => e.preventDefault()}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs",
          "[--slide-up-from:20px]",
          "data-[state=open]:animate-slide-up",
        )}
        aria-describedby={undefined}
      >
        <ShopifyInboxOverlayGuard />
        <div className="relative w-full max-w-md overflow-hidden rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur transition-colors hover:bg-gray-100 focus-visible:outline-0"
              aria-label="Close"
            >
              <Icon name="x" size={16} />
            </button>
          </Dialog.Close>
          <Dialog.Title className={titleClassName}>{title}</Dialog.Title>
          {/* Mounted only while the dialog is open, so every opening starts
              from the cart's current values. */}
          {children}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

function DialogActions({
  submitLabel,
  loading,
  submitProps,
}: {
  submitLabel: string;
  loading: boolean;
  submitProps?: { name: string; value: string };
}) {
  return (
    <div className="flex items-center justify-end gap-3">
      <Dialog.Close asChild>
        <Button variant="custom" className="w-24 border-none">
          Cancel
        </Button>
      </Dialog.Close>
      {/* A plain button: the cart store reads the intent from the submitter's
          `name`/`value`, which `Button` doesn't forward in its types. */}
      <button
        type="submit"
        {...submitProps}
        disabled={loading}
        className={buttonVariants({
          className: "w-24 leading-tight! [--spinner-duration:400ms]",
        })}
      >
        {loading && <Spinner />}
        <span>{submitLabel}</span>
      </button>
    </div>
  );
}

export function NoteDialog() {
  return (
    <DialogShell title="Add a note" titleClassName="mb-4 text-lg font-medium">
      <NoteForm />
    </DialogShell>
  );
}

function NoteForm() {
  const { formProps, register } = useCartForm();
  const currentNote = useCart((state) => state.data.note);
  const pending = useCart((state) => state.pending.note);
  const noteErrors = useCart((state) => state.errors.note);
  const [note, setNote] = useState(currentNote ?? "");
  const [phase, setPhase] = useSubmissionPhase(pending);
  const submitted = phase === "done" && noteErrors.userErrors.length === 0;
  const error = phase === "done" ? noteErrors.userErrors[0]?.message : null;

  return (
    <form
      className="space-y-4"
      {...formProps({ afterSubmit: () => setPhase("sent") })}
    >
      <textarea
        className="min-h-20 w-full resize-none p-3"
        placeholder="Add any special instructions or notes for your order..."
        rows={4}
        {...register("note", { value: note })}
        aria-invalid={error ? true : undefined}
        onChange={(e) => {
          setNote(e.target.value);
          setPhase("idle");
        }}
      />
      {submitted && (
        <Banner variant="success">Cart note saved successfully 🎉</Banner>
      )}
      {error && (
        <Banner variant="error" role="alert">
          {error}
        </Banner>
      )}
      <DialogActions
        submitLabel="Save note"
        submitProps={register("note-update")}
        loading={phase === "sent" || pending}
      />
    </form>
  );
}

export function DiscountDialog() {
  return (
    <DialogShell title="Apply a discount code">
      <DiscountForm />
    </DialogShell>
  );
}

function DiscountForm() {
  const { formProps, register } = useCartForm();
  const discountCodes = useCart((state) => state.data.discountCodes);
  const [code, setCode] = useState("");
  const [submittedCode, setSubmittedCode] = useState("");
  const pending = useCart((state) =>
    state.pending.discountCodes.has(submittedCode),
  );
  const codeError = useCart((state) =>
    state.errors.discountCodes.get(submittedCode),
  );
  const [phase, setPhase] = useSubmissionPhase(pending);
  const success =
    phase === "done" &&
    discountCodes.some((d) => d.code === submittedCode && d.applicable);
  const error = phase === "done" && !success;

  function handleBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    // An empty code or one already on the cart has nothing to apply.
    const trimmed = code.trim();
    if (!trimmed || discountCodes.some((d) => d.code === trimmed)) {
      event.preventDefault();
      if (trimmed) {
        setSubmittedCode(trimmed);
        setPhase("done");
      }
    }
  }

  return (
    <form
      className="space-y-4"
      {...formProps({
        beforeSubmit: handleBeforeSubmit,
        afterSubmit: () => {
          setSubmittedCode(code.trim());
          setPhase("sent");
        },
      })}
    >
      <input
        {...register("discountCode", { value: code })}
        onChange={(e) => {
          setCode(e.target.value);
          setPhase("idle");
        }}
        className="w-full p-3"
        type="text"
        placeholder="Discount code"
        aria-invalid={error || undefined}
        required
      />
      {success && (
        <Banner variant="success">Discount applied successfully 🎉</Banner>
      )}
      {error && (
        <Banner variant="error" role="alert">
          {codeError?.userErrors[0]?.message || "Invalid discount code."}
        </Banner>
      )}
      <DialogActions
        submitLabel="Apply"
        submitProps={register("discount-apply")}
        loading={phase === "sent" || pending}
      />
    </form>
  );
}

export function GiftCardDialog() {
  return (
    <DialogShell title="Redeem a gift card">
      <GiftCardForm />
    </DialogShell>
  );
}

function GiftCardForm() {
  const { refresh } = useCartActions();
  const { pathname, search } = useLocation();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const giftCardCode = code.trim();
    if (!giftCardCode) {
      return;
    }
    setStatus("loading");
    // Shopify silently ignores a code it can't apply; the endpoint reports
    // that as a `GIFT_CARD_NOT_APPLIED` user error.
    const userErrors = await postGiftCards({
      intent: "add",
      giftCardCodes: [giftCardCode],
    });
    if (userErrors.length === 0) {
      refresh();
    }
    setStatus(userErrors.length === 0 ? "success" : "error");
  }

  return (
    <form
      method="post"
      action={CART_GIFT_CARDS_PATH}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <input type="hidden" name="intent" value="add" />
      <input type="hidden" name="redirectTo" value={pathname + search} />
      <input
        className="w-full p-3"
        type="text"
        name="giftCardCodes"
        placeholder="Gift card code"
        value={code}
        aria-invalid={status === "error" || undefined}
        onChange={(e) => {
          setCode(e.target.value);
          setStatus("idle");
        }}
        required
      />
      {status === "success" && (
        <Banner variant="success">Gift card applied successfully 🎉</Banner>
      )}
      {status === "error" && (
        <Banner variant="error" role="alert">
          Invalid gift card code.
        </Banner>
      )}
      <DialogActions submitLabel="Redeem" loading={status === "loading"} />
    </form>
  );
}
