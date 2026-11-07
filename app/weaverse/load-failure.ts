import {
  type WeaverseThemeSettingsResponse,
  type WeaverseClient,
  WeaverseLoadError,
} from "@weaverse/hydrogen/react-router";
import { data } from "react-router";

/** Marker carried by the error response, read by the root error boundary. */
export type WeaverseRouteFailure = { weaverseFailure: "unavailable" | "error" };

const NO_STORE = { "Cache-Control": "no-store" };

/**
 * The route response for a Weaverse page that could not be loaded.
 *
 * A missing page is not a failure — the SDK still resolves it to `null` or a
 * fallback page, and the route answers 404 as before. What reaches here is an
 * API that could not answer (`unavailable`) or answered with something that
 * is not a page (`invalid-response`): both are 503 so shoppers and crawlers
 * retry instead of treating the URL as gone. A refused or misconfigured
 * request (`configuration`) will not fix itself on retry, so it is a plain
 * 500. Neither may be cached.
 */
export function weaverseRouteFailure(error: unknown): unknown {
  if (!(error instanceof WeaverseLoadError)) {
    return error;
  }
  const retryable = error.kind !== "configuration";
  return data<WeaverseRouteFailure>(
    { weaverseFailure: retryable ? "unavailable" : "error" },
    { status: retryable ? 503 : 500, headers: NO_STORE },
  );
}

/**
 * Makes every `loadPage` call on `client` throw a route response on failure.
 *
 * Applied once where the client is created, so no route can forget it: each
 * page route keeps calling `context.weaverse.loadPage` and a failure leaves
 * the loader as a 503/500 instead of a `null` that reads as a missing page.
 */
export function throwRouteFailures(client: WeaverseClient): WeaverseClient {
  const loadPage = client.loadPage;
  client.loadPage = async (params) => {
    try {
      return await loadPage(params);
    } catch (error) {
      throw weaverseRouteFailure(error);
    }
  };
  return client;
}

/**
 * Theme settings the theme schema ships with demo content for. When the
 * merchant's settings could not be loaded, these would present Pilot's logo,
 * Weaverse's social accounts and a sample discount offer as the merchant's.
 * Cleared, the header and footer fall back to the Shopify shop name.
 */
const DEMO_SETTINGS = {
  logoData: null,
  transparentLogoData: null,
  footerLogoData: null,
  socialInstagram: "",
  socialX: "",
  socialLinkedIn: "",
  socialFacebook: "",
  newsletterPopupEnabled: false,
};

/**
 * Bundled copy that reads as the merchant's own facts or offers: a sample
 * store address and email, Weaverse's copyright line and promotional
 * announcements. Without the merchant's published text it is left blank.
 */
const DEMO_COPY = {
  footer: {
    bio: "",
    addressTitle: "",
    storeAddress: "",
    storeEmail: "",
    copyright: "",
  },
  announcement: { topbarText: "" },
};

/** Whether the merchant's theme settings could not be loaded. */
export function isThemeUnavailable(
  theme: WeaverseThemeSettingsResponse,
): boolean {
  return theme._loadFailed === true;
}

/**
 * Theme data safe to render when the merchant's settings could not be
 * loaded: schema defaults and bundled copy without demo branding, so the
 * header and footer show the Shopify shop name. Loaded settings pass
 * through. Apply after localizing, which would otherwise add market copy
 * back.
 */
export function neutralThemeWhenUnavailable<
  T extends WeaverseThemeSettingsResponse,
>(theme: T): T {
  if (!isThemeUnavailable(theme)) {
    return theme;
  }
  const content = theme.staticContent ?? {};
  const section = (key: keyof typeof DEMO_COPY) => ({
    ...(content[key] as Record<string, unknown> | undefined),
    ...DEMO_COPY[key],
  });
  // `_error` is a server diagnostic; it stays in the server log.
  return {
    ...theme,
    _error: undefined,
    theme: { ...theme.theme, ...DEMO_SETTINGS },
    staticContent: {
      ...content,
      footer: section("footer"),
      announcement: section("announcement"),
    },
  };
}

/** Response headers for a document rendered without the merchant's theme. */
export const DEGRADED_HEADERS = NO_STORE;
