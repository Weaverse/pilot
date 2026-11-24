import { type Locale, localizePath, providerLanguageFor } from "~/utils/locale";

/**
 * Customer Account URLs shared by the server and the browser.
 *
 * Hydrogen's Customer Account handlers own `/account/login`,
 * `/account/authorize`, `/account/refresh` and `/account/logout`. Those paths
 * are fixed and never carry a market prefix, so the market travels in the
 * query string instead. Link to them with a plain `<a>`/`<form>`, never the
 * router's `<Link>`/`<Form>`: the handlers answer with a raw redirect that
 * client-side routing cannot follow.
 */

/** Pilot's endpoint for the header account web component's token. */
export const CUSTOMER_ACCESS_TOKEN_PATH = "/api/account/token";

/**
 * The `locale` Shopify's login page renders in, built the way classic
 * Hydrogen built it from the request language: `de`, `zh-CN`, `pt-BR`.
 */
function loginPageLocale(locale: Locale): string {
  const [language, region] = providerLanguageFor(locale)
    .toLowerCase()
    .split("_");
  return region ? `${language}-${region.toUpperCase()}` : language;
}

/**
 * The sign-in URL that brings the shopper back to `returnTo` in `locale`'s
 * market, with Shopify's login page in the market's language.
 *
 * `returnTo` is a same-origin path; it is localized here, so a market-neutral
 * path (`/account`) and an already-prefixed one (`/de-de/account`) both work.
 */
export function customerAccountLoginPath(
  returnTo: string,
  locale: Locale,
): string {
  const query = new URLSearchParams({
    return_to: localizePath(returnTo, locale),
    locale: loginPageLocale(locale),
  });
  return `/account/login?${query.toString()}`;
}

/**
 * The action of a sign-out `<form method="post">`. It carries no market: the
 * logout handler remembers it in the session for
 * {@link CUSTOMER_ACCOUNT_SIGNED_OUT_PATH}.
 */
export const CUSTOMER_ACCOUNT_LOGOUT_PATH = "/account/logout";

/**
 * Where Shopify returns every sign-out. It redirects on to the home page of
 * the market the shopper signed out of, so the store registers this one
 * logout URI (`https://shop.example/account/signed-out`) in the Customer
 * Account API settings instead of one per market.
 */
export const CUSTOMER_ACCOUNT_SIGNED_OUT_PATH = "/account/signed-out";
