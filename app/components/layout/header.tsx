import { MagnifyingGlassIcon, UserIcon } from "@phosphor-icons/react";
import { useThemeSettings } from "@weaverse/hydrogen";
import { cva } from "class-variance-authority";
import { Suspense } from "react";
import {
  Await,
  useLocation,
  useRouteError,
  useRouteLoaderData,
} from "react-router";
import useWindowScroll from "react-use/esm/useWindowScroll";
import { CartDrawer } from "~/components/cart/cart-drawer";
import Link from "~/components/link";
import type { RootLoader } from "~/root";
import type { ThemeSettings } from "~/types/weaverse";
import { cn } from "~/utils/cn";
import { DEFAULT_LOCALE } from "~/utils/const";
import { HeaderCountrySelector } from "./country-selector";
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
  let rootData = useRouteLoaderData<RootLoader>("root");
  let publicStoreDomain = rootData?.publicStoreDomain;
  let publicAccessToken = rootData?.consent?.storefrontAccessToken;

  return (
    <Suspense fallback={<UserIcon className="h-5 w-5" />}>
      <Await
        resolve={rootData?.customerAccessToken}
        errorElement={<UserIcon className="h-5 w-5" />}
      >
        {(customerAccessToken) => (
          <shopify-store
            store-domain={publicStoreDomain}
            public-access-token={publicAccessToken}
            customer-access-token={customerAccessToken || undefined}
          >
            <shopify-account sign-in-url="/account/login">
              <span slot="signed-out-avatar">
                <UserIcon className="h-5 w-5" />
              </span>
            </shopify-account>
          </shopify-store>
        )}
      </Await>
    </Suspense>
  );
}
