import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { useCartActions } from "~/components/cart/cart-store";
import { CART_BUYER_IDENTITY_PATH } from "~/utils/cart";
import type { Locale } from "~/utils/locale";
import { syncShopifyMarket } from "~/utils/shopify";

/**
 * Switches the storefront to `locale`.
 *
 * Hydrated, the switch is a client-side navigation to the market's URL while
 * Pilot's `/api/cart/buyer-identity` moves the cart (and so its prices and
 * checkout) to the new market; the cart store refreshes once both are done.
 * Without JavaScript the form posts to the same endpoint, which moves the cart
 * and redirects to `redirectTo`.
 *
 * The submit control is a plain button, never a `Popover.Close`: closing the
 * popover unmounts this form synchronously during the click, so the browser
 * drops the submission. `onSwitch` closes it once the submission has started.
 */
export function MarketForm({
  locale,
  redirectTo,
  className,
  children,
  label,
  onSwitch,
}: {
  locale: Locale;
  redirectTo: string;
  className?: string;
  children: React.ReactNode;
  label: string;
  onSwitch?: () => void;
}) {
  const navigate = useNavigate();
  const { refresh } = useCartActions();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSwitch?.();
    // Before navigating, so the next page view already reports the new market.
    syncShopifyMarket(locale);
    await Promise.all([
      navigate(redirectTo),
      fetch(CART_BUYER_IDENTITY_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode: locale.country }),
      }).catch(() => null),
    ]);
    refresh();
  }

  return (
    <form
      method="post"
      action={CART_BUYER_IDENTITY_PATH}
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input type="hidden" name="countryCode" value={locale.country} />
      <button
        type="submit"
        aria-label={label}
        lang={locale.hreflang}
        className={className}
      >
        {children}
      </button>
    </form>
  );
}
