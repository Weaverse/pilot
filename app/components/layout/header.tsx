import { MagnifyingGlassIcon, UserIcon } from "@phosphor-icons/react";
import { useNonce } from "@shopify/hydrogen";
import { useThemeSettings } from "@weaverse/hydrogen";
import { cva } from "class-variance-authority";
import { useEffect, useRef, useState } from "react";
import { useLocation, useRouteError, useRouteLoaderData } from "react-router";
import useWindowScroll from "react-use/esm/useWindowScroll";
import { CartDrawer } from "~/components/cart/cart-drawer";
import {
  useCartStore,
  useCustomerAccessTokenKnown,
} from "~/components/cart/store";
import Link from "~/components/link";
import type { RootLoader } from "~/root";
import type { ThemeSettings } from "~/types/weaverse";
import { cn } from "~/utils/cn";
import { DEFAULT_LOCALE } from "~/utils/const";
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
    const shopifyWindow = window as Window & {
      Shopify?: Record<string, unknown>;
    };
    shopifyWindow.Shopify = shopifyWindow.Shopify || {};
    await loadModuleScript(STOREFRONT_WEB_COMPONENTS_SRC, nonce);
    await customElements.whenDefined("shopify-store");
    await loadModuleScript(ACCOUNT_WEB_COMPONENTS_SRC, nonce);
    await customElements.whenDefined("shopify-account");
  })();

  return shopifyAccountComponentsPromise;
}

function useIsHomeCheck() {
  const { pathname } = useLocation();
  const rootData = useRouteLoaderData<RootLoader>("root");
  const selectedLocale = rootData?.selectedLocale ?? DEFAULT_LOCALE;
  return pathname.replace(selectedLocale.pathPrefix, "") === "/";
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
        "border-gray-200 border-b",
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
            <MagnifyingGlassIcon className="h-5 w-5" />
          </Link>
          <div className="hidden lg:block">
            <Logo />
          </div>
        </div>
        {/* Center: logo on mobile, desktop menu on desktop */}
        <div className="flex items-center justify-center">
          <div className="lg:hidden h-[calc(var(--height-nav)-0.75rem)]">
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
  // Bootstrapped client-side via /api/cart (CartStoreSync) — the token must
  // not be embedded in the SSR document, which stays anonymous so Oxygen
  // can full-page cache it.
  const customerAccessToken = useCartStore(
    (state) => state.customerAccessToken,
  );
  // Until the auth state is known — first bootstrap response, re-checked
  // after auth-mutating navigations like the logout redirect — mounting an
  // active <shopify-account> with a stale/null token would open the wrong
  // flow for shoppers who click during that window. Render an inert icon
  // instead (the old Suspense fallback, which also re-suspended after
  // actions revalidated the root loader's token promise).
  const customerAccessTokenKnown = useCustomerAccessTokenKnown();

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
        <UserIcon className="h-5 w-5" />
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
        <UserIcon className="h-5 w-5" />
      </button>
    );
  }

  return (
    <shopify-store
      store-domain={publicStoreDomain}
      public-access-token={publicAccessToken}
      customer-access-token={customerAccessToken || undefined}
    >
      <shopify-account ref={accountRef} sign-in-url="/account/login">
        <span slot="signed-out-avatar">
          <UserIcon className="h-5 w-5" />
        </span>
      </shopify-account>
    </shopify-store>
  );
}
