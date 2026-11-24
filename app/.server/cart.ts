import {
  createCartServerHandlers,
  createShopifyRouteHandler,
  getCartId,
  gql,
  type ShopifyRouteHandlerContext,
  type ShopifyRouteHandlerResult,
} from "@shopify/hydrogen";
import type { CustomerSession } from "@shopify/hydrogen/customer-account";
import type { Storefront } from "~/.server/storefront";
import { CACHE_NONE } from "~/utils/cache";
import { CART_BUYER_IDENTITY_PATH, CART_GIFT_CARDS_PATH } from "~/utils/cart";
import {
  INVALID_CART_NOTE_MESSAGE,
  isCartNoteInput,
  normalizeCartNote,
} from "~/utils/cart-note";
import { localizePath, SUPPORTED_LOCALES } from "~/utils/locale";
import { safeRedirectPath } from "~/utils/safe-redirect";

/**
 * Cart fields Pilot renders beyond Hydrogen's default cart fragment. Hydrogen
 * merges this into every cart query and mutation, so the cart store, the
 * `/api/cart` response and `refresh()` all carry them.
 */
const CART_FRAGMENT = gql(`
  fragment CartFragment on Cart {
    appliedGiftCards {
      id
      lastCharacters
      amountUsed {
        amount
        currencyCode
      }
    }
    buyerIdentity {
      countryCode
      email
      phone
      customer {
        id
        email
        firstName
        lastName
        displayName
      }
    }
    lines(first: 250) {
      pageInfo {
        hasNextPage
      }
      nodes {
        discountAllocations {
          discountedAmount {
            amount
            currencyCode
          }
          targetType
        }
        # Line-level and order-level allocations together; replaces the
        # deprecated \`Cart.discountAllocations\` for the summary total.
        allDiscountAllocations: discountAllocations(lineLevelOnly: false) {
          discountedAmount {
            amount
            currencyCode
          }
          targetType
        }
        sellingPlanAllocation {
          sellingPlan {
            name
          }
        }
        merchandise {
          ... on ProductVariant {
            availableForSale
            requiresShipping
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            requiresComponents
            components(first: 10) {
              nodes {
                quantity
                productVariant {
                  id
                  title
                  product {
                    handle
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`);

/**
 * Hydrogen's cart handlers without a customer: for storefronts without
 * Customer Accounts, server-side cart reads, and the cart data type.
 */
export const cartHandlers = createCartServerHandlers({
  fragment: CART_FRAGMENT,
});

/**
 * Hydrogen's cart handlers for a storefront with Customer Accounts. Passed to
 * the Customer Account handlers as `cartServerHandlers`, they attach the
 * customer to the cart on sign-in and token refresh, detach them on sign-out
 * and on a refresh Shopify rejects (expiring the `cart` cookie when that
 * detach fails), and create first carts with the customer attached.
 */
export function createCustomerCartHandlers(customerSession: CustomerSession) {
  return createCartServerHandlers({
    fragment: CART_FRAGMENT,
    customerSession,
  });
}

type CartHandlers =
  | typeof cartHandlers
  | ReturnType<typeof createCustomerCartHandlers>;

const CART_BUYER_COUNTRY_UPDATE = gql(`
  mutation PilotCartBuyerIdentity(
    $cartId: ID!
    $buyerIdentity: CartBuyerIdentityInput!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        checkoutUrl
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`);

const CART_GIFT_CARDS_ADD = gql(`
  mutation PilotCartGiftCardsAdd(
    $cartId: ID!
    $giftCardCodes: [String!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    cartGiftCardCodesAdd(cartId: $cartId, giftCardCodes: $giftCardCodes) {
      cart {
        appliedGiftCards {
          id
          lastCharacters
        }
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`);

const CART_GIFT_CARDS_REMOVE = gql(`
  mutation PilotCartGiftCardsRemove(
    $cartId: ID!
    $appliedGiftCardIds: [ID!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    cartGiftCardCodesRemove(
      cartId: $cartId
      appliedGiftCardIds: $appliedGiftCardIds
    ) {
      userErrors {
        code
        field
        message
      }
    }
  }
`);

const CART_GIFT_CARDS_QUERY = gql(`
  query PilotCartGiftCards(
    $cartId: ID!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    cart(id: $cartId) {
      appliedGiftCards {
        id
      }
    }
  }
`);

const CART_API_PATH = "/api/cart";

type CartUserError = {
  code?: string | null;
  field?: string[] | null;
  message: string;
};

/**
 * Moves a cart into the request's market, and onto the signed-in customer,
 * before it changes.
 *
 * A cart keeps the country it was created in, so a shopper who switches
 * market would otherwise keep paying the old market's prices and taxes. A
 * signed-in customer's access token goes along, so checkout knows the
 * customer, as classic Hydrogen's cart did on every buyer-identity update.
 * A `null` token detaches the customer: a cart must not stay tied to a
 * customer whose session ended (a shared browser). `undefined` leaves the
 * cart's customer as it is. This runs before every cart mutation, as Pilot's
 * classic cart action did.
 */
export async function syncCartCountry(
  request: Request,
  storefront: Storefront,
  {
    countryCode = storefront.locale.country,
    customerAccessToken,
    cartId = getCartId(request),
  }: {
    countryCode?: Storefront["locale"]["country"];
    customerAccessToken?: string | null;
    cartId?: string | null;
  } = {},
) {
  if (!cartId) return { checkoutUrl: null, userErrors: [] as CartUserError[] };
  const result = await storefront.graphql(CART_BUYER_COUNTRY_UPDATE, {
    variables: {
      cartId,
      buyerIdentity:
        customerAccessToken === undefined
          ? { countryCode }
          : { countryCode, customerAccessToken },
    },
  });
  if (result.errors) throw new Error(result.errors[0].message);
  const payload = result.data?.cartBuyerIdentityUpdate;
  return {
    checkoutUrl: payload?.cart?.checkoutUrl ?? null,
    userErrors: (payload?.userErrors ?? []) as CartUserError[],
  };
}

/** Shopify's user error for a cart ID that no longer resolves to a cart. */
function isMissingCartError(error: CartUserError) {
  return error.code === "INVALID" && Boolean(error.field?.includes("cartId"));
}

/** `request` without its `cart` cookie. */
function withoutCartCookie(request: Request) {
  const headers = new Headers(request.headers);
  const cookies = (headers.get("Cookie") ?? "")
    .split(";")
    .filter((cookie) => !cookie.trim().startsWith("cart="));
  headers.set("Cookie", cookies.join(";"));
  return new Request(request, { headers });
}

function isFormRequest(request: Request) {
  const type = request.headers.get("Content-Type") ?? "";
  return (
    type.includes("application/x-www-form-urlencoded") ||
    type.includes("multipart/form-data")
  );
}

/**
 * Where a native (no-JS) form post lands: a same-origin `redirectTo`, else the
 * cart page of the market the shopper submitted from.
 */
function formRedirect(
  storefront: Storefront,
  redirectTo: FormDataEntryValue | null,
): ShopifyRouteHandlerResult {
  const fallback = localizePath("/cart", storefront.locale);
  return {
    type: "redirect",
    location: safeRedirectPath(redirectTo, fallback),
    status: 303,
  };
}

function missingCart(): ShopifyRouteHandlerResult {
  return {
    type: "error",
    status: 400,
    error: { code: "missing_cart", message: "The request has no cart." },
  };
}

function invalidNote(): ShopifyRouteHandlerResult {
  return {
    type: "error",
    status: 400,
    error: { code: "invalid_cart_request", message: INVALID_CART_NOTE_MESSAGE },
  };
}

/**
 * A note update with its note normalized (an all-whitespace note clears the
 * note), as Pilot's classic cart action did. Every other request passes
 * through untouched.
 */
async function normalizeNoteRequest(
  request: Request,
): Promise<Request | ShopifyRouteHandlerResult> {
  const headers = new Headers(request.headers);
  headers.delete("Content-Length");
  if (isFormRequest(request)) {
    const form = await request.clone().formData();
    if (form.get("intent") !== "note-update") return request;
    const note = form.get("note");
    if (!isCartNoteInput(note)) return invalidNote();
    const body = new URLSearchParams();
    for (const [key, value] of form) {
      if (typeof value === "string") {
        body.append(key, key === "note" ? normalizeCartNote(value) : value);
      }
    }
    headers.set("Content-Type", "application/x-www-form-urlencoded");
    return new Request(request, { method: request.method, body, headers });
  }
  const json = (await request
    .clone()
    .json()
    .catch(() => null)) as Record<string, unknown> | null;
  if (!json || typeof json !== "object" || !("note" in json)) return request;
  if (!isCartNoteInput(json.note)) return invalidNote();
  return new Request(request, {
    method: request.method,
    body: JSON.stringify({ ...json, note: normalizeCartNote(json.note) }),
    headers,
  });
}

async function readBody(request: Request) {
  if (isFormRequest(request)) {
    const form = await request.formData();
    return { form, json: null };
  }
  const json = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  return { form: null, json };
}

/**
 * Pilot's cart endpoints that Hydrogen's cart handlers don't cover yet, for
 * one request. They must be registered before `cartHandlers`: the first
 * `POST /api/cart` match wins, and this one syncs the cart's market and
 * customer and then delegates to `hydrogenCartHandlers`, which attach a
 * signed-in customer to a cart they create.
 *
 * `getCustomerAccessToken` resolves the cart's customer token as
 * `syncCartCountry` takes it: the signed-in customer's token, `null` once
 * nobody is signed in, or `undefined` when that can't be told.
 */
export function createPilotCartHandlers({
  hydrogenCartHandlers,
  getCustomerAccessToken,
}: {
  hydrogenCartHandlers: CartHandlers;
  getCustomerAccessToken: () => Promise<string | null | undefined>;
}) {
  async function customerAccessToken() {
    return getCustomerAccessToken().catch(() => undefined);
  }

  return {
    post: createShopifyRouteHandler(
      CART_API_PATH,
      "POST",
      async (context: ShopifyRouteHandlerContext) => {
        const normalized = await normalizeNoteRequest(context.request);
        if (!(normalized instanceof Request)) return normalized;
        const storefront = context.storefrontClient as Storefront;
        const token = await customerAccessToken();
        const { userErrors } = await syncCartCountry(normalized, storefront, {
          customerAccessToken: token,
        });
        // The cookie can outlive its cart (expired, or completed at checkout).
        // Hydrogen would add to that cart and fail; without the cookie it
        // creates a fresh cart and sets the new cookie.
        const request = userErrors.some(isMissingCartError)
          ? withoutCartCookie(normalized)
          : normalized;
        return hydrogenCartHandlers.post({ ...context, request });
      },
    ),

    /**
     * Sets the cart's country. The country selector posts here with
     * `countryCode` (the market being switched to) and `redirectTo`.
     */
    buyerIdentity: createShopifyRouteHandler(
      CART_BUYER_IDENTITY_PATH,
      "POST",
      async ({ request, ...context }: ShopifyRouteHandlerContext) => {
        const storefrontClient = context.storefrontClient as Storefront;
        const { form, json } = await readBody(request);
        const requested = String(
          form?.get("countryCode") ?? json?.countryCode ?? "",
        ).toUpperCase();
        const redirectTo = form?.get("redirectTo") ?? null;
        // Only a country Pilot sells in may become the cart's country.
        const market = SUPPORTED_LOCALES.find(
          (locale) => locale.country === requested,
        );
        const countryCode = market?.country ?? storefrontClient.locale.country;
        const { userErrors } = await syncCartCountry(
          request,
          storefrontClient,
          {
            countryCode,
            customerAccessToken: await customerAccessToken(),
          },
        );
        if (form) return formRedirect(storefrontClient, redirectTo);
        return { type: "json", data: { userErrors } };
      },
    ),

    /**
     * Applies or removes gift card codes. `intent` is `add` (with
     * `giftCardCodes`) or `remove` (with `appliedGiftCardIds`).
     *
     * Shopify ignores a code it can't apply without returning a user error, so
     * an add that doesn't grow `appliedGiftCards` reports `GIFT_CARD_NOT_APPLIED`.
     */
    giftCards: createShopifyRouteHandler(
      CART_GIFT_CARDS_PATH,
      "POST",
      async ({ request, ...context }: ShopifyRouteHandlerContext) => {
        const storefrontClient = context.storefrontClient as Storefront;
        const { form, json } = await readBody(request);
        const intent = String(form?.get("intent") ?? json?.intent ?? "");
        const values = (key: string) =>
          (form
            ? form.getAll(key).map(String)
            : ((json?.[key] as string[] | undefined) ?? [])
          )
            .map((value) => value.trim())
            .filter(Boolean);
        const cartId = getCartId(request);
        if (!cartId) return missingCart();
        const synced = await syncCartCountry(request, storefrontClient, {
          customerAccessToken: await customerAccessToken(),
        });
        if (synced.userErrors.some(isMissingCartError)) return missingCart();

        let userErrors: CartUserError[] = [];
        if (intent === "add") {
          const giftCardCodes = values("giftCardCodes");
          const before = await storefrontClient.graphql(CART_GIFT_CARDS_QUERY, {
            variables: { cartId },
            cache: CACHE_NONE,
          });
          if (before.errors) throw new Error(before.errors[0].message);
          const result = await storefrontClient.graphql(CART_GIFT_CARDS_ADD, {
            variables: { cartId, giftCardCodes },
          });
          if (result.errors) throw new Error(result.errors[0].message);
          const payload = result.data?.cartGiftCardCodesAdd;
          userErrors = (payload?.userErrors ?? []) as CartUserError[];
          const appliedBefore = before.data?.cart?.appliedGiftCards.length ?? 0;
          const appliedAfter = payload?.cart?.appliedGiftCards.length ?? 0;
          if (
            giftCardCodes.length > 0 &&
            userErrors.length === 0 &&
            appliedAfter <= appliedBefore
          ) {
            userErrors = [
              {
                code: "GIFT_CARD_NOT_APPLIED",
                field: ["giftCardCodes"],
                message: "This gift card code could not be applied.",
              },
            ];
          }
        } else if (intent === "remove") {
          const result = await storefrontClient.graphql(
            CART_GIFT_CARDS_REMOVE,
            {
              variables: {
                cartId,
                appliedGiftCardIds: values("appliedGiftCardIds"),
              },
            },
          );
          if (result.errors) throw new Error(result.errors[0].message);
          userErrors = (result.data?.cartGiftCardCodesRemove?.userErrors ??
            []) as CartUserError[];
        } else {
          return {
            type: "error",
            status: 400,
            error: {
              code: "invalid_cart_request",
              message: "intent must be add or remove.",
            },
          };
        }

        if (form) {
          return formRedirect(storefrontClient, form.get("redirectTo"));
        }
        return { type: "json", data: { userErrors } };
      },
    ),
  };
}
