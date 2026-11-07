import * as Dialog from "@radix-ui/react-dialog";
import { useThemeSettings } from "@weaverse/hydrogen/react-router";
import clsx from "clsx";
import { useState } from "react";
import { useLocation } from "react-router";
import { Button } from "~/components/button";
import { Icon } from "~/components/icon";
import { Link } from "~/components/link";
import { Money } from "~/components/money";
import { Skeleton } from "~/components/skeleton";
import { Spinner } from "~/components/spinner";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { CartLayoutType } from "~/types/others";
import type { ThemeSettings } from "~/types/weaverse";
import { CART_GIFT_CARDS_PATH, cartDiscountTotal } from "~/utils/cart";
import { cn } from "~/utils/cn";
import {
  type CartData,
  useCart,
  useCartActions,
  useCartForm,
} from "./cart-store";
import {
  DiscountDialog,
  GiftCardDialog,
  NoteDialog,
  postGiftCards,
} from "./cart-summary-actions";

type AppliedGiftCard = CartData["appliedGiftCards"][number];

/**
 * Removes one applied gift card. A real form, so it also works before
 * hydration: `/api/cart/gift-cards` then redirects back to this page.
 */
function GiftCardRemoveButton({ giftCard }: { giftCard: AppliedGiftCard }) {
  const { refresh } = useCartActions();
  const { pathname, search } = useLocation();
  const [removing, setRemoving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRemoving(true);
    const userErrors = await postGiftCards({
      intent: "remove",
      appliedGiftCardIds: [giftCard.id],
    });
    if (userErrors.length === 0) {
      // The chip unmounts once the refreshed cart drops the gift card.
      refresh();
    } else {
      setRemoving(false);
    }
  }

  return (
    <form method="post" action={CART_GIFT_CARDS_PATH} onSubmit={handleSubmit}>
      <input type="hidden" name="intent" value="remove" />
      <input type="hidden" name="appliedGiftCardIds" value={giftCard.id} />
      <input type="hidden" name="redirectTo" value={pathname + search} />
      <button
        type="submit"
        className="relative ml-1 size-4 transition-colors hover:text-red-600"
        aria-label={`Remove gift card code ${giftCard.id}`}
        disabled={removing}
      >
        {removing ? (
          <Spinner size={16} />
        ) : (
          <Icon name="x" className="size-4" aria-hidden="true" />
        )}
      </button>
    </form>
  );
}

function DiscountRemoveButton({ code }: { code: string }) {
  const { formProps, register } = useCartForm();
  const removing = useCart((state) => state.pending.discountCodes.has(code));

  return (
    <form {...formProps()}>
      <input type="hidden" {...register("discountCode", { value: code })} />
      <button
        type="submit"
        {...register("discount-remove")}
        className="relative ml-1 size-4 transition-colors hover:text-red-600"
        aria-label={`Remove discount code ${code}`}
      >
        {removing ? (
          <Spinner size={16} />
        ) : (
          <Icon name="x" className="size-4" aria-hidden="true" />
        )}
      </button>
    </form>
  );
}

export function CartSummary({
  cart,
  layout,
}: {
  cart: CartData;
  layout: CartLayoutType;
}) {
  const {
    enableCartNote,
    cartNoteButtonText,
    enableDiscountCode,
    discountCodeButtonText,
    enableGiftCard,
    giftCardButtonText,
    checkoutButtonText,
  } = useThemeSettings<ThemeSettings>();
  const checkoutRoute = usePrefixPathWithLocale("/cart/checkout");
  const { search } = useLocation();
  // The storefront query rides along so `/cart/checkout` can forward ad
  // attribution (gclid, utm_*, …) to Shopify's checkout.
  const checkoutHref = `${checkoutRoute}${search}`;
  const { cost, discountCodes, checkoutUrl, appliedGiftCards } = cart;
  const cartDiscount = cartDiscountTotal(cart);

  // Totals are stale while a line or discount change is in flight, or while
  // the store refetches the cart (after overlapping changes or a gift card
  // change).
  const isCartUpdating = useCart(
    (state) => state.pending.cost === true || state.revalidating === true,
  );
  return (
    <div
      className={clsx(
        layout === "drawer" && "border-t border-gray-300 pt-4",
        layout === "page" &&
          "sticky top-[calc(var(--height-nav)+20px)] w-full rounded-sm py-4 md:translate-y-4 md:px-6 lg:py-0",
      )}
    >
      <h2 id="summary-heading" className="sr-only">
        Order summary
      </h2>
      {appliedGiftCards?.length > 0 && (
        <div className="mb-4 flex flex-wrap justify-end gap-2">
          {appliedGiftCards.map((giftCard) => (
            <div
              key={giftCard.id}
              className="flex items-center justify-center gap-2 rounded-md bg-gray-200 px-2 py-1.5 [&>form]:flex"
            >
              <Icon name="gift" className="h-4.5 w-4.5" aria-hidden="true" />
              <div className="flex items-center gap-1 leading-normal">
                <span>***{giftCard.lastCharacters}</span>
                <span className="inline-flex items-center">
                  (-{<Money data={giftCard.amountUsed} />})
                </span>
              </div>
              <GiftCardRemoveButton giftCard={giftCard} />
            </div>
          ))}
        </div>
      )}
      {discountCodes?.length > 0 && (
        <div className="mb-4 flex flex-wrap justify-end gap-2">
          {discountCodes
            .filter((discount) => discount.applicable)
            .map((discount) => (
              <div
                key={discount.code}
                className="flex items-center justify-center gap-2 rounded-md bg-gray-200 px-2 py-1.5 [&>form]:flex"
              >
                <Icon name="tag" className="h-4.5 w-4.5" aria-hidden="true" />
                <span className="leading-normal">{discount.code}</span>
                <DiscountRemoveButton code={discount.code} />
              </div>
            ))}
        </div>
      )}
      {cartDiscount && !isCartUpdating && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <Icon name="tag" className="h-4.5 w-4.5" aria-hidden="true" />
            Discount
          </span>
          <span className="inline-flex items-center">
            -<Money data={cartDiscount} />
          </span>
        </div>
      )}
      {layout === "page" && (
        <dl className="mb-4 grid">
          <div className="flex items-center justify-between text-xl font-medium">
            <dt>Estimated total:</dt>
            {isCartUpdating ? (
              <Skeleton className="h-4 w-20 rounded-md" />
            ) : (
              <dd>
                {cost?.totalAmount?.amount ? (
                  <Money data={cost?.totalAmount} />
                ) : (
                  "-"
                )}
              </dd>
            )}
          </div>
        </dl>
      )}
      {(enableCartNote || enableDiscountCode || enableGiftCard) && (
        <div className="mb-2 flex items-center justify-end gap-3">
          {enableCartNote && (
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button type="button" className="flex items-center gap-1.5">
                  <Icon name="note-pencil" className="size-4" />
                  {layout === "drawer"
                    ? cartNoteButtonText || "Note"
                    : cartNoteButtonText || "Add a note"}
                </button>
              </Dialog.Trigger>
              <NoteDialog />
            </Dialog.Root>
          )}
          {enableCartNote && (enableDiscountCode || enableGiftCard) && (
            <span className="text-gray-400">/</span>
          )}
          {enableDiscountCode && (
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button type="button" className="flex items-center gap-1.5">
                  <Icon name="tag" className="size-4" />
                  {layout === "drawer"
                    ? discountCodeButtonText || "Discount"
                    : discountCodeButtonText || "Add a discount code"}
                </button>
              </Dialog.Trigger>
              <DiscountDialog />
            </Dialog.Root>
          )}
          {enableDiscountCode && enableGiftCard && (
            <span className="text-gray-400">/</span>
          )}
          {enableGiftCard && (
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button type="button" className="flex items-center gap-1.5">
                  <Icon name="gift" className="size-4" />
                  {layout === "drawer"
                    ? giftCardButtonText || "Gift card"
                    : giftCardButtonText || "Redeem a gift card"}
                </button>
              </Dialog.Trigger>
              <GiftCardDialog />
            </Dialog.Root>
          )}
        </div>
      )}
      {checkoutUrl && (
        <div className="mt-2 flex flex-col gap-3">
          <a
            href={isCartUpdating ? undefined : checkoutHref}
            target="_self"
            aria-disabled={isCartUpdating || undefined}
          >
            <Button
              className="w-full"
              disabled={isCartUpdating}
              aria-busy={isCartUpdating || undefined}
            >
              <span>{checkoutButtonText || "Continue to Checkout"}</span>
              {layout === "drawer" && (
                <>
                  <span className="mx-1.5">·</span>
                  {isCartUpdating ? (
                    <Skeleton className="h-4 w-16 rounded-md bg-white/30" />
                  ) : cost?.totalAmount?.amount ? (
                    <Money data={cost?.totalAmount} />
                  ) : (
                    "-"
                  )}
                </>
              )}
            </Button>
          </a>
          {/* @todo: <CartShopPayButton cart={cart} /> */}
          <div
            className={cn(
              "text-body-subtle text-sm",
              layout === "page" && "text-right",
            )}
          >
            * Taxes, discounts and{" "}
            <Link
              target="_blank"
              to="/policies/shipping-policy"
              variant="underline"
              className="text-current after:bg-current"
            >
              shipping
            </Link>{" "}
            calculated at checkout.
          </div>
        </div>
      )}
    </div>
  );
}
