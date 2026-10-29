import {
  createShopifyRouteHandler,
  type ShopifyRouteHandlerContext,
} from "@shopify/hydrogen";
import {
  type AnyCustomerAccountDocument,
  type CustomerAccountClient,
  type CustomerAccountGqlRestParam,
  type CustomerSession,
  createCustomerAccountClient,
  createCustomerAccountServerHandlers,
  createCustomerSession,
} from "@shopify/hydrogen/customer-account";
import { redirectDocument } from "react-router";
import type { AppSession } from "~/.server/session";
import { resolveRequestLocale, type Storefront } from "~/.server/storefront";
import {
  CUSTOMER_ACCESS_TOKEN_PATH,
  customerAccountLoginPath,
} from "~/utils/customer-account";
import { delocalizePath, localizePath } from "~/utils/locale";

const CUSTOMER_ACCOUNT_HANDLER_PATH =
  /^\/account\/(login|authorize|refresh|logout)$/;

// Reused across requests in the same isolate, so concurrent token refreshes
// for one customer share a single request to Shopify.
let cached:
  | {
      key: string;
      session: CustomerSession;
      handlers: ReturnType<typeof createCustomerAccountServerHandlers>;
    }
  | undefined;

/**
 * The shop's customer session, or `undefined` when Customer Accounts are not
 * configured. `createCustomerSession` throws on a missing shop ID or client
 * ID, and a storefront without accounts must keep serving pages.
 */
function getCustomerSession(env: Env) {
  if (!hasCustomerAccounts(env)) return undefined;
  const key = `${env.SHOP_ID}:${env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID}`;
  if (cached?.key !== key) {
    const session = createCustomerSession({
      shopId: env.SHOP_ID,
      customerAccountApiClientId: env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID,
    });
    const handlers = createCustomerAccountServerHandlers({
      customerSession: session,
      // A sign-in that carries no `return_to` lands on the account page.
      defaultPostLoginRedirectPathname: "/account",
    });
    cached = { key, session, handlers };
  }
  return cached;
}

/** Whether this storefront has Customer Accounts configured. */
export function hasCustomerAccounts(env: Env) {
  if (!env.SHOP_ID || !env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID) return false;
  // `createCustomerSession` throws on a non-numeric shop ID; a misconfigured
  // value must disable accounts, not take every page down with a 500.
  if (!/^\d+$/.test(env.SHOP_ID)) {
    console.warn(
      `[customer-account] SHOP_ID must be the numeric shop ID; got "${env.SHOP_ID}". Customer Accounts are disabled.`,
    );
    return false;
  }
  return true;
}

/**
 * The header's `<shopify-account>` web component needs the customer's access
 * token. It is fetched after hydration from this private, uncacheable
 * endpoint and never rendered into the HTML, which stays anonymous so Oxygen
 * can full-page cache it. Answers `null` when nobody is signed in or Customer
 * Accounts are not configured.
 */
function customerAccessTokenHandler(customerSession?: CustomerSession) {
  return createShopifyRouteHandler(
    CUSTOMER_ACCESS_TOKEN_PATH,
    "GET",
    async ({
      sessionManager,
      requestContext,
    }: Pick<
      ShopifyRouteHandlerContext,
      "sessionManager" | "requestContext"
    >) => {
      const customerAccessToken = customerSession
        ? await customerSession
            .getOrRefreshAccessToken(sessionManager, requestContext)
            .catch(() => undefined)
        : undefined;
      return {
        type: "json",
        data: { customerAccessToken: customerAccessToken ?? null },
        headers: { "Cache-Control": "private, no-store" },
      };
    },
  );
}

/**
 * Pilot's Customer Account route handlers for `handleShopifyRoutes`:
 * Hydrogen's `/account/login`, `/account/authorize`, `/account/refresh` and
 * `/account/logout` (fixed and unprefixed; link to them with plain
 * `<a>`/`<form>`, never the router's `<Link>`/`<Form>`), plus the header's
 * access-token endpoint. Without Customer Accounts only the token endpoint is
 * registered, answering `null`.
 */
export function getCustomerAccountHandlers(env: Env) {
  const customer = getCustomerSession(env);
  const accessToken = customerAccessTokenHandler(customer?.session);
  return customer ? { ...customer.handlers, accessToken } : { accessToken };
}

/**
 * The options of `customerAccount.graphql()`: the client's own, minus the
 * access token the wrapper attaches. Optional when the document has no
 * required variables.
 */
type GraphqlOptions<Doc extends AnyCustomerAccountDocument> = Omit<
  CustomerAccountGqlRestParam<Doc>[0],
  "accessToken"
>;
type GraphqlRestParam<Doc extends AnyCustomerAccountDocument> =
  object extends GraphqlOptions<Doc>
    ? [options?: GraphqlOptions<Doc>]
    : [options: GraphqlOptions<Doc>];

/**
 * The Customer Account API as Pilot's account routes use it.
 *
 * `graphql` attaches the customer's access token, refreshing it when needed
 * (the refreshed tokens reach the browser because `server.ts` commits the
 * session on every response). Without a session it throws a redirect to the
 * login handler with a localized `return_to`, so a shopper bounced from
 * `/de-de/account` signs in and comes back to the German market.
 */
export function createCustomerAccount({
  env,
  request,
  session,
  storefront,
}: {
  env: Env;
  request: Request;
  session: AppSession;
  storefront: Storefront;
}) {
  const requestContext = storefront.requestContext;
  // The canonical market (public language), for URLs. `storefront.i18n`
  // carries Shopify's provider language instead.
  const market = resolveRequestLocale(request);
  const customerSession = getCustomerSession(env)?.session;
  let client: CustomerAccountClient | undefined;

  async function getAccessToken() {
    return customerSession?.getOrRefreshAccessToken(session, requestContext);
  }

  /**
   * Hydrogen's login handler lives at the unprefixed `/account/login`, so the
   * market rides in `return_to` and `locale`. The redirect reloads the
   * document: answering a `.data` request, a plain redirect would make React
   * Router route `/account/login` client-side into the account catch-all
   * instead of reaching the handler.
   *
   * `return_to` drops React Router's single-fetch `.data` suffix and `/_root`
   * segment and a trailing slash, so it round-trips as a real page path.
   */
  function loginRedirect() {
    const path = new URL(request.url).pathname
      .replace(/\.data$/, "")
      .replace(/\/_root$/, "/")
      .replace(/(.+)\/$/, "$1");
    // Returning to a handler path (reached via a client-side `<Link>` that
    // should have been a plain `<a>`) would start another sign-in.
    const returnTo = CUSTOMER_ACCOUNT_HANDLER_PATH.test(delocalizePath(path))
      ? "/account"
      : path;
    return redirectDocument(customerAccountLoginPath(returnTo, market));
  }

  async function requireAccessToken() {
    const accessToken = await getAccessToken();
    if (!accessToken) throw loginRedirect();
    return accessToken;
  }

  return {
    i18n: storefront.i18n,
    async isLoggedIn() {
      return customerSession
        ? customerSession.isLoggedIn(session, requestContext)
        : false;
    },
    getAccessToken,
    /** Throws a localized login redirect when the shopper has no session. */
    async handleAuthStatus() {
      await requireAccessToken();
    },
    async graphql<const Doc extends AnyCustomerAccountDocument>(
      doc: Doc,
      ...[options]: GraphqlRestParam<Doc>
    ) {
      const accessToken = await requireAccessToken();
      client ??= createCustomerAccountClient({
        shopId: env.SHOP_ID,
        requestContext,
      });
      // `GraphqlRestParam` is the client's parameter minus `accessToken`;
      // TypeScript cannot re-derive that for a generic `Doc`.
      const rest = [
        { ...options, accessToken },
      ] as CustomerAccountGqlRestParam<Doc>;
      return client.graphql(doc, ...rest);
    },
    /**
     * Signs the shopper out without a form post and returns them to their
     * market's home page: clears the customer session (committed by
     * `server.ts`) and redirects through Shopify's logout when the session
     * held an ID token. Used when the session turns out to be unusable.
     *
     * Shopify redirects to the home URL after clearing its own session, so
     * every market's home URL must be registered as an allowed logout URI in
     * the Customer Account API settings.
     */
    async logout() {
      const home = localizePath("/", market);
      return redirectDocument(
        customerSession
          ? await customerSession.logout(session, requestContext, {
              postLogoutRedirectUri: home,
            })
          : home,
      );
    },
  };
}

export type CustomerAccount = ReturnType<typeof createCustomerAccount>;
