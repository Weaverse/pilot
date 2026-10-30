import { useThemeSettings } from "@weaverse/hydrogen/react-router";
import { cva } from "class-variance-authority";
import { useEffect, useRef, useState } from "react";
import {
  useLocation,
  useNavigation,
  useRouteError,
  useRouteLoaderData,
} from "react-router";
import useWindowScroll from "react-use/esm/useWindowScroll";
import { CartDrawer } from "~/components/cart/cart-drawer";
import { Icon } from "~/components/icon";
import Link from "~/components/link";
import type { RootLoader } from "~/root";
import type { ThemeSettings } from "~/types/weaverse";
import { cn } from "~/utils/cn";
import { useNonce } from "~/utils/csp";
import {
  CUSTOMER_ACCESS_TOKEN_PATH,
  customerAccountLoginPath,
} from "~/utils/customer-account";
import { delocalizePath, resolveLocale } from "~/utils/locale";
import { HeaderCountrySelector } from "./country-selector/header-country-selector";
import { Logo } from "./logo";
import { DesktopMenu } from "./menu/desktop-menu";
import { MobileMenu } from "./menu/mobile-menu";
import { PredictiveSearchButton } from "./predictive-search";

const variants = cva("", {
  variants: {
    width: {
      full: "w-full",
      stretch: "w-full",
      fixed: "mx-auto w-full max-w-(--page-width)",
    },
    padding: {
      full: "",
      stretch: "px-3 md:px-10 lg:px-16",
      fixed: "mx-auto px-3 md:px-4 lg:px-6",
    },
  },
});

const STOREFRONT_WEB_COMPONENTS_SRC =
  "https://cdn.shopify.com/storefront/web-components.js";
const ACCOUNT_WEB_COMPONENTS_SRC =
  "https://cdn.shopify.com/storefront/web-components/account.js";

let shopifyAccountComponentsPromise: Promise<void> | null = null;

function loadModuleScript(src: string, nonce?: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error(`Failed to load ${src}`)),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.type = "module";
    script.src = src;
    if (nonce) {
      script.nonce = nonce;
    }
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener(
      "error",
      () => reject(new Error(`Failed to load ${src}`)),
      { once: true },
    );
    document.head.appendChild(script);
  });
}

function loadShopifyAccountComponents(nonce?: string) {
  if (typeof document === "undefined") {
    return Promise.resolve();
  }
  if (
    customElements.get("shopify-store") &&
    customElements.get("shopify-account")
  ) {
    return Promise.resolve();
  }

  shopifyAccountComponentsPromise ??= (async () => {
    // account.js otherwise defines window.Shopify as non-configurable before
    // Hydrogen analytics gets a chance to define/update it. Keep this here too
    // so intent-loading stays safe even if root.tsx's tiny bootstrap script is
    // ever removed.
    if (!window.Shopify) {
      Object.assign(window, { Shopify: {} });
    }
    await loadModuleScript(STOREFRONT_WEB_COMPONENTS_SRC, nonce);
    await customElements.whenDefined("shopify-store");
    await loadModuleScript(ACCOUNT_WEB_COMPONENTS_SRC, nonce);
    await customElements.whenDefined("shopify-account");
  })();

  return shopifyAccountComponentsPromise;
}

type CustomerAccessTokenState = {
  /** False until this navigation's token response arrives. */
  known: boolean;
  token: string | null;
};

/**
 * The signed-in customer's access token for the account web component.
 *
 * Fetched after hydration from Pilot's private, no-store
 * `CUSTOMER_ACCESS_TOKEN_PATH` endpoint: the token must never be embedded in
 * the SSR document, which stays anonymous so Oxygen can full-page cache it.
 * It is re-fetched on every navigation (an expired token is refreshed
 * server-side) and is unknown while a non-GET submission is in flight, since
 * an action may change the auth state.
 */
function useCustomerAccessToken(): CustomerAccessTokenState {
  const location = useLocation();
  const navigation = useNavigation();
  const [state, setState] = useState<CustomerAccessTokenState>({
    known: false,
    token: null,
  });
  // Set when a submission starts, cleared by the next token response.
  const [stale, setStale] = useState(false);
  const isAuthRelevantSubmission =
    navigation.state !== "idle" &&
    navigation.formMethod != null &&
    navigation.formMethod !== "GET";
  if (isAuthRelevantSubmission && !stale) {
    setStale(true);
  }

  useEffect(() => {
    if (isAuthRelevantSubmission) {
      return;
    }
    const controller = new AbortController();
    function apply(token: unknown) {
      // A superseded request is aborted; the next one owns the state.
      if (controller.signal.aborted) {
        return;
      }
      setStale(false);
      setState({
        known: true,
        token: typeof token === "string" ? token : null,
      });
    }
    fetch(CUSTOMER_ACCESS_TOKEN_PATH, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then((response) =>
        response.ok
          ? (response.json() as Promise<{ customerAccessToken?: unknown }>)
          : null,
      )
      .then((payload) => apply(payload?.customerAccessToken))
      .catch(() => apply(null));
    return () => controller.abort();
  }, [location.key, isAuthRelevantSubmission]);

  return { known: state.known && !stale, token: state.token };
}

function useIsHomeCheck() {
  const { pathname } = useLocation();
  return delocalizePath(pathname) === "/";
}

export function Header() {
  const { enableTransparentHeader, headerWidth, showHeaderCountrySelector } =
    useThemeSettings<ThemeSettings>();
  const isHome = useIsHomeCheck();
  const { y } = useWindowScroll();
  const routeError = useRouteError();

  const scrolled = y >= 50;
  const enableTransparent = enableTransparentHeader && isHome && !routeError;
  const isTransparent = enableTransparent && !scrolled;

  return (
    <header
      className={cn(
        "z-10 w-full",
        "transition-all duration-300 ease-in-out",
        "bg-(--color-header-bg) hover:bg-(--color-header-bg)",
        "text-(--color-header-text) hover:text-(--color-header-text)",
        "border-b border-gray-200",
        variants({ padding: headerWidth }),
        scrolled ? "shadow-header" : "shadow-none",
        enableTransparent
          ? [
              "group/header fixed w-screen",
              "top-(--topbar-height,var(--initial-topbar-height))",
            ]
          : "sticky top-0",
        isTransparent
          ? [
              "border-transparent bg-transparent",
              "text-(--color-transparent-header-text)",
              "[&_.cart-count]:text-(--color-header-text)",
              "[&_.cart-count]:bg-(--color-transparent-header-text)",
              "hover:[&_.cart-count]:bg-(--color-header-text)",
              "hover:[&_.cart-count]:text-(--color-transparent-header-text)",
              "[&_.main-logo]:opacity-0 hover:[&_.main-logo]:opacity-100",
              "[&_.transparent-logo]:opacity-100 hover:[&_.transparent-logo]:opacity-0",
            ]
          : [
              "[&_.cart-count]:text-(--color-header-bg)",
              "[&_.cart-count]:bg-(--color-header-text)",
              "[&_.main-logo]:opacity-100",
              "[&_.transparent-logo]:opacity-0",
            ],
      )}
    >
      <div
        className={cn(
          "grid h-(--height-nav) grid-cols-[1fr_auto_1fr] items-center gap-2 py-1.5 lg:gap-8 lg:py-3",
          variants({ width: headerWidth }),
        )}
      >
        {/* Left: hamburger + search on mobile, logo on desktop */}
        <div className="flex items-center gap-1">
          <MobileMenu />
          <Link to="/search" className="p-1.5 lg:hidden">
            <Icon name="magnifying-glass" className="h-5 w-5" />
          </Link>
          <div className="hidden lg:block">
            <Logo />
          </div>
        </div>
        {/* Center: logo on mobile, desktop menu on desktop */}
        <div className="flex items-center justify-center">
          <div className="h-[calc(var(--height-nav)-0.75rem)] lg:hidden">
            <Logo />
          </div>
          <DesktopMenu />
        </div>
        {/* Right: icons */}
        <div className="z-1 flex items-center justify-end gap-1">
          {showHeaderCountrySelector && <HeaderCountrySelector />}
          <PredictiveSearchButton />
          <ShopifyAccountButton />
          <CartDrawer />
        </div>
      </div>
    </header>
  );
}

function ShopifyAccountButton() {
  const nonce = useNonce();
  const { pathname, search } = useLocation();
  // The web component navigates to this URL itself (a full document load, as
  // Hydrogen's unprefixed login handler needs), so it must already carry the
  // market or sign-in drops the shopper onto the default storefront. After
  // signing in, the shopper returns to the page they were on.
  const signInUrl = customerAccountLoginPath(
    pathname + search,
    resolveLocale(pathname),
  );
  const accountRef = useRef<HTMLElement>(null);
  const shouldOpenWhenReadyRef = useRef(false);
  const rootData = useRouteLoaderData<RootLoader>("root");
  const publicStoreDomain = rootData?.publicStoreDomain;
  const publicAccessToken = rootData?.consent?.storefrontAccessToken;
  const [componentsReady, setComponentsReady] = useState(
    () =>
      typeof customElements !== "undefined" &&
      customElements.get("shopify-store") !== undefined &&
      customElements.get("shopify-account") !== undefined,
  );
  const [isLoading, setIsLoading] = useState(false);
  // Until the auth state is known — first token response, re-checked after
  // auth-mutating submissions — mounting an active <shopify-account> with a
  // stale/null token would open the wrong flow for shoppers who click during
  // that window. Render an inert icon instead (the old Suspense fallback,
  // which also re-suspended after actions revalidated the root loader's
  // token promise).
  const { known: customerAccessTokenKnown, token: customerAccessToken } =
    useCustomerAccessToken();

  function warmAccountComponents(openWhenReady = false) {
    if (!(customerAccessTokenKnown && publicAccessToken && publicStoreDomain)) {
      return;
    }
    if (componentsReady) {
      if (openWhenReady) {
        accountRef.current?.click();
      }
      return;
    }
    if (openWhenReady) {
      shouldOpenWhenReadyRef.current = true;
      setIsLoading(true);
    }
    loadShopifyAccountComponents(nonce)
      .then(() => {
        setComponentsReady(true);
      })
      .catch(() => {
        shouldOpenWhenReadyRef.current = false;
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    if (!(componentsReady && shouldOpenWhenReadyRef.current)) {
      return;
    }
    shouldOpenWhenReadyRef.current = false;
    requestAnimationFrame(() => accountRef.current?.click());
  }, [componentsReady]);

  if (!customerAccessTokenKnown) {
    return (
      <span aria-hidden="true">
        <Icon name="user" className="h-5 w-5" />
      </span>
    );
  }

  if (!componentsReady) {
    return (
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center focus-visible:outline-hidden"
        aria-label={isLoading ? "Loading account" : "Account"}
        aria-busy={isLoading || undefined}
        onClick={() => warmAccountComponents(true)}
        onFocus={() => warmAccountComponents()}
        onPointerEnter={() => warmAccountComponents()}
      >
        <Icon name="user" className="h-5 w-5" />
      </button>
    );
  }

  return (
    <shopify-store
      store-domain={publicStoreDomain}
      public-access-token={publicAccessToken}
      customer-access-token={customerAccessToken || undefined}
    >
      <shopify-account ref={accountRef} sign-in-url={signInUrl}>
        <span slot="signed-out-avatar">
          <Icon name="user" className="h-5 w-5" />
        </span>
      </shopify-account>
    </shopify-store>
  );
}
