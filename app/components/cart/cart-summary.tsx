import * as Dialog from "@radix-ui/react-dialog";
import { CartForm, Money, type OptimisticCart } from "@shopify/hydrogen";
import { useThemeSettings } from "@weaverse/hydrogen";
import clsx from "clsx";
import { useState } from "react";
import { useFetcher, useLocation } from "react-router";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { Button } from "~/components/button";
import { Icon } from "~/components/icon";
import { Link } from "~/components/link";
import { Skeleton } from "~/components/skeleton";
import { Spinner } from "~/components/spinner";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { CartLayoutType } from "~/types/others";
import type { ThemeSettings } from "~/types/weaverse";
import { cn } from "~/utils/cn";
import {
  DiscountDialog,
  GiftCardDialog,
  NoteDialog,
} from "./cart-summary-actions";
import { useCartFetcherSync } from "./store";

// Discount allocations live in two disjoint scopes: order-level discounts
// ("X% off entire order") land in cart.discountAllocations, while line-scoped
// codes ("X% off <collection/product>") allocate per line and leave the
// cart-level array empty. Summing both is correct — they never overlap.
// SHIPPING_LINE allocations (free-shipping discounts) are excluded: the summary
// renders no shipping charge, so a shipping discount here wouldn't reconcile.
function getCartDiscountTotal(cart: OptimisticCart<CartApiQueryFragment>) {
  const allocations = [
    ...(cart.discountAllocations ?? []),
    ...(cart.lines?.nodes ?? []).flatMap(
      (line) => line.discountAllocations ?? [],
    ),
  ].filter(({ targetType }) => targetType === "LINE_ITEM");
  const amount = allocations.reduce(
    (sum, { discountedAmount }) =>
      sum + Number.parseFloat(discountedAmount.amount),
    0,
  );
  const currencyCode =
    cart.cost?.subtotalAmount?.currencyCode ??
    allocations[0]?.discountedAmount.currencyCode;
  if (amount <= 0 || !currencyCode) {
    return null;
  }
  // Round to the currency's minor-unit precision (3-decimal KWD/BHD/TND,
  // 0-decimal JPY, …) so the summed float matches how <Money> formats it.
  const decimals = new Intl.NumberFormat("en", {
    style: "currency",
    currency: currencyCode,
  }).resolvedOptions().maximumFractionDigits;
  return { amount: amount.toFixed(decimals), currencyCode };
}

export function CartSummary({
  cart,
  layout,
}: {
  cart: OptimisticCart<CartApiQueryFragment>;
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
  const [removingDiscountCode, setRemovingDiscountCode] = useState<
    string | null
  >(null);
  const [removingGiftCard, setRemovingGiftCard] = useState<string | null>(null);
  const dcRemoveFetcher = useFetcher({ key: "discount-code-remove" });
  const gcRemoveFetcher = useFetcher({ key: "gift-card-remove" });
  const cartRoute = usePrefixPathWithLocale("/cart");
  const checkoutRoute = usePrefixPathWithLocale("/cart/checkout");
  const { search } = useLocation();
  const checkoutHref = `${checkoutRoute}${search}`;
  // Line removal submits with this stable fetcherKey. The CartLineItem that
  // owns the trash button unmounts the moment the line is optimistically
  // spliced out, so its own fetcher response would be lost. Reading the keyed
  // fetcher here (CartSummary stays mounted while the cart has items) captures
  // the authoritative post-remove cart — including the updated cost.
  const lineRemoveFetcher = useFetcher({ key: "cart-line-remove" });
  useCartFetcherSync(dcRemoveFetcher);
  useCartFetcherSync(gcRemoveFetcher);
  useCartFetcherSync(lineRemoveFetcher);
  const {
    cost,
    discountCodes,
    isOptimistic,
    checkoutUrl,
    appliedGiftCards,
    note,
  } = cart;
  const cartDiscount = getCartDiscountTotal(cart);

  // Show loading state for optimistic line item changes or pending cart actions
  const isCartUpdating =
    isOptimistic ||
    dcRemoveFetcher.state !== "idle" ||
    gcRemoveFetcher.state !== "idle" ||
    lineRemoveFetcher.state !== "idle";
  return (
    <div
      className={clsx(
        layout === "drawer" && "border-gray-300 border-t pt-4",
        layout === "page" &&
          "sticky top-[calc(var(--height-nav)+20px)] w-full rounded-sm py-4 md:translate-y-4 md:px-6 lg:py-0",
      )}
    >
      <h2 id="summary-heading" className="sr-only">
        Order summary
      </h2>
      {appliedGiftCards?.length > 0 && (
        <div className="mb-4 flex flex-wrap justify-end gap-2">
          {appliedGiftCards.map((giftCard) => {
            // Check if this specific gift card is being removed
            const isGCRemoving =
              gcRemoveFetcher.state !== "idle" &&
              removingGiftCard === giftCard.lastCharacters;
            return (
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
                <CartForm
                  route={cartRoute}
                  action={CartForm.ACTIONS.GiftCardCodesRemove}
                  inputs={{
                    giftCardCodes: [giftCard.id],
                  }}
                  fetcherKey="gift-card-remove"
                >
                  <button
                    type="submit"
                    className="relative ml-1 size-4 transition-colors hover:text-red-600"
                    aria-label={`Remove gift card code ${giftCard.id}`}
                    onClick={() => setRemovingGiftCard(giftCard.lastCharacters)}
                  >
                    {isGCRemoving ? (
                      <Spinner size={16} />
                    ) : (
                      <Icon name="x" className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </CartForm>
              </div>
            );
          })}
        </div>
      )}
      {discountCodes?.length > 0 && (
        <div className="mb-4 flex flex-wrap justify-end gap-2">
          {discountCodes
            .filter((discount) => discount.applicable)
            .map((discount) => {
              const codes = discountCodes
                .filter((d) => d.applicable)
                .map((d) => d.code);
              const updatedCodes = codes.filter((c) => c !== discount.code);

              // Check if this specific discount is being removed
              const isDCRemoving =
                dcRemoveFetcher.state !== "idle" &&
                removingDiscountCode === discount.code;

              return (
                <div
                  key={discount.code}
                  className="flex items-center justify-center gap-2 rounded-md bg-gray-200 px-2 py-1.5 [&>form]:flex"
                >
                  <Icon name="tag" className="h-4.5 w-4.5" aria-hidden="true" />
                  <span className="leading-normal">{discount.code}</span>
                  <CartForm
                    route={cartRoute}
                    action={CartForm.ACTIONS.DiscountCodesUpdate}
                    inputs={{ discountCodes: updatedCodes || [] }}
                    fetcherKey="discount-code-remove"
                  >
                    <button
                      type="submit"
                      className="relative ml-1 size-4 transition-colors hover:text-red-600"
                      aria-label={`Remove discount code ${discount.code}`}
                      onClick={() => setRemovingDiscountCode(discount.code)}
                    >
                      {isDCRemoving ? (
                        <Spinner size={16} />
                      ) : (
                        <Icon name="x" className="size-4" aria-hidden="true" />
                      )}
                    </button>
                  </CartForm>
                </div>
              );
            })}
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
              <NoteDialog cartNote={note} />
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
              <DiscountDialog discountCodes={discountCodes} />
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
              <GiftCardDialog appliedGiftCards={appliedGiftCards} />
            </Dialog.Root>
          )}
        </div>
      )}
      {checkoutUrl && (
        <div className="mt-2 flex flex-col gap-3">
          <a href={checkoutHref} target="_self">
            <Button className="w-full">
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
