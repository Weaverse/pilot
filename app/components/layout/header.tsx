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
import Link from "~/components/link";
import { Logo } from "~/components/logo";
import type { RootLoader } from "~/root";
import { cn } from "~/utils/cn";
import { DEFAULT_LOCALE } from "~/utils/const";
import { CartDrawer } from "./cart-drawer";
import { DesktopMenu } from "./desktop-menu";
import { MobileMenu } from "./mobile-menu";
import { PredictiveSearchButton } from "./predictive-search";

const variants = cva("", {
  variants: {
    width: {
      full: "w-full h-full",
      stretch: "w-full h-full",
      fixed: "w-full h-full max-w-(--page-width) mx-auto",
    },
    padding: {
      full: "",
      stretch: "px-3 md:px-10 lg:px-16",
      fixed: "px-3 md:px-4 lg:px-6 mx-auto",
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
  const { enableTransparentHeader, headerWidth } = useThemeSettings();
  const isHome = useIsHomeCheck();
  const { y } = useWindowScroll();
  const routeError = useRouteError();

  const scrolled = y >= 50;
  const enableTransparent = enableTransparentHeader && isHome && !routeError;
  const isTransparent = enableTransparent && !scrolled;

  return (
    <header
      className={cn(
        "w-full z-10",
        "transition-all duration-300 ease-in-out",
        "bg-(--color-header-bg) hover:bg-(--color-header-bg)",
        "text-(--color-header-text) hover:text-(--color-header-text)",
        "border-b border-line-subtle",
        variants({ padding: headerWidth }),
        scrolled ? "shadow-header" : "shadow-none",
        enableTransparent
          ? [
              "fixed w-screen group/header",
              "top-(--topbar-height,var(--initial-topbar-height))",
            ]
          : "sticky top-0",
        isTransparent
          ? [
              "bg-transparent border-transparent",
              "text-(--color-transparent-header-text)",
              "[&_.cart-count]:text-(--color-header-text)",
              "[&_.cart-count]:bg-(--color-transparent-header-text)",
              "[&_.main-logo]:opacity-0",
              "[&_.transparent-logo]:opacity-100",
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
          "h-(--height-nav) py-1.5 lg:py-3 flex items-center justify-between gap-2 lg:gap-8",
          variants({ width: headerWidth }),
        )}
      >
        <MobileMenu />
        <Link to="/search" className="p-1.5 lg:hidden">
          <MagnifyingGlassIcon className="w-5 h-5" />
        </Link>
        <Logo />
        <DesktopMenu />
        <div className="flex items-center gap-1 z-1">
          <PredictiveSearchButton />
          <AccountLink className="relative flex items-center justify-center w-8 h-8" />
          <CartDrawer />
        </div>
      </div>
    </header>
  );
}

function AccountLink({ className }: { className?: string }) {
  const rootData = useRouteLoaderData<RootLoader>("root");
  const isLoggedIn = rootData?.isLoggedIn;

  return (
    <Link to="/account" className={className}>
      <Suspense fallback={<UserIcon className="w-5 h-5" />}>
        <Await
          resolve={isLoggedIn}
          errorElement={<UserIcon className="w-5 h-5" />}
        >
          {(isLoggedIn) =>
            isLoggedIn ? (
              <UserIcon className="w-5 h-5" />
            ) : (
              <UserIcon className="w-5 h-5" />
            )
          }
        </Await>
      </Suspense>
    </Link>
  );
}
