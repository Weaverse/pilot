import { Form } from "react-router";
import type { Locale } from "~/utils/locale";

/**
 * Switches the storefront to `locale`.
 *
 * Posts to the cart route so Shopify's buyer identity (and therefore pricing
 * and checkout) moves to the new market in the same request that redirects to
 * its URL. `reloadDocument` forces a document navigation: a client-side
 * navigation would keep the cached Weaverse page instance for the previous
 * market and render its content under the new locale until the next hard load.
 *
 * A real form (rather than an onClick submit) keeps the control keyboard
 * operable and working without JavaScript.
 *
 * The submit control is a plain button, never a `Popover.Close`: closing the
 * popover unmounts this form synchronously during the click, so the browser
 * drops the pending native submission and the market never changes. The
 * document navigation tears the popover down instead.
 */
export function MarketForm({
  locale,
  cartRoute,
  redirectTo,
  buyerIdentityInput,
  className,
  children,
  label,
}: {
  locale: Locale;
  cartRoute: string;
  redirectTo: string;
  buyerIdentityInput: string;
  className?: string;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Form method="POST" action={cartRoute} reloadDocument>
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input type="hidden" name="cartFormInput" value={buyerIdentityInput} />
      <button
        type="submit"
        aria-label={label}
        lang={locale.hreflang}
        className={className}
      >
        {children}
      </button>
    </Form>
  );
}
