import { GiftIcon, TagIcon, XIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import { CartForm, Money, type OptimisticCart } from "@shopify/hydrogen";
import { useThemeSettings } from "@weaverse/hydrogen";
import clsx from "clsx";
import { useState } from "react";
import { useFetcher } from "react-router";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { Button } from "~/components/button";
import { Link } from "~/components/link";
import { Skeleton } from "~/components/skeleton";
import { Spinner } from "~/components/spinner";
import type { CartLayoutType } from "~/types/others";
import {
  DiscountDialog,
  GiftCardDialog,
  NoteDialog,
} from "./cart-summary-actions";

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
  } = useThemeSettings();
  const [removingDiscountCode, setRemovingDiscountCode] = useState<
    string | null
  >(null);
  const [removingGiftCard, setRemovingGiftCard] = useState<string | null>(null);
  const dcRemoveFetcher = useFetcher({ key: "discount-code-remove" });
  const gcRemoveFetcher = useFetcher({ key: "gift-card-remove" });
  const {
    cost,
    discountCodes,
    isOptimistic,
    checkoutUrl,
    appliedGiftCards,
    note,
  } = cart;

  // Show loading state for optimistic line item changes or pending cart actions
  const isCartUpdating =
    isOptimistic ||
    dcRemoveFetcher.state !== "idle" ||
    gcRemoveFetcher.state !== "idle";
  return (
    <div
      className={clsx(
        layout === "drawer" && "grid border-line-subtle border-t pt-4",
        layout === "page" &&
          "sticky top-(--height-nav) grid w-full rounded-sm py-4 md:translate-y-4 md:px-6 lg:py-0",
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
                <GiftIcon className="h-4.5 w-4.5" aria-hidden="true" />
                <div className="flex items-center gap-1 leading-normal">
                  <span>***{giftCard.lastCharacters}</span>
                  <span className="inline-flex items-center">
                    (-{<Money data={giftCard.amountUsed} />})
                  </span>
                </div>
                <CartForm
                  route="/cart"
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
                      <XIcon
                        className="size-4"
                        weight="regular"
                        aria-hidden="true"
                      />
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
                  <TagIcon className="h-4.5 w-4.5" aria-hidden="true" />
                  <span className="leading-normal">{discount.code}</span>
                  <CartForm
                    route="/cart"
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
                        <XIcon
                          className="size-4"
                          weight="regular"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </CartForm>
                </div>
              );
            })}
        </div>
      )}
      <dl className="mb-4 grid">
        <div
          className={clsx(
            "flex items-center justify-between font-medium",
            layout === "page" && "text-xl",
          )}
        >
          <dt>Estimated total:</dt>
          {isCartUpdating ? (
            <Skeleton className="h-4 w-20 rounded" />
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
      <div className="mb-2 text-right text-body-subtle">
        Taxes, discounts and{" "}
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
      {(enableCartNote || enableDiscountCode || enableGiftCard) && (
        <div className="mb-4 flex items-center justify-end gap-2">
          {enableCartNote && (
            <>
              <Dialog.Root>
                <Dialog.Trigger asChild>
                  <Button variant="underline">
                    {cartNoteButtonText || "Add a note"}
                  </Button>
                </Dialog.Trigger>
                <NoteDialog cartNote={note} />
              </Dialog.Root>
              {(enableDiscountCode || enableGiftCard) && <span>/</span>}
            </>
          )}
          {enableDiscountCode && (
            <>
              <Dialog.Root>
                <Dialog.Trigger asChild>
                  <Button variant="underline">
                    {discountCodeButtonText || "Add a discount code"}
                  </Button>
                </Dialog.Trigger>
                <DiscountDialog discountCodes={discountCodes} />
              </Dialog.Root>
              {enableGiftCard && <span>/</span>}
            </>
          )}
          {enableGiftCard && (
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <Button variant="underline">
                  {giftCardButtonText || "Redeem a gift card"}
                </Button>
              </Dialog.Trigger>
              <GiftCardDialog appliedGiftCards={appliedGiftCards} />
            </Dialog.Root>
          )}
        </div>
      )}
      {checkoutUrl && (
        <div className="mt-4 flex flex-col gap-3">
          <a href={checkoutUrl} target="_self">
            <Button className="w-full">
              {checkoutButtonText || "Continue to Checkout"}
            </Button>
          </a>
          {/* @todo: <CartShopPayButton cart={cart} /> */}
          {layout === "drawer" && (
            <Link variant="underline" to="/cart" className="mx-auto w-fit">
              View cart
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
