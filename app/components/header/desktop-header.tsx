import {
  Await,
  Link,
  useRouteError,
  useRouteLoaderData,
} from "@remix-run/react";
import { useThemeSettings } from "@weaverse/hydrogen";
import { cva } from "class-variance-authority";
import { Suspense } from "react";
import useWindowScroll from "react-use/esm/useWindowScroll";
import { IconUser } from "~/components/icons";
import { Logo } from "~/components/logo";
import { cn } from "~/lib/cn";
import { useIsHomePath } from "~/lib/utils";
import type { RootLoader } from "~/root";
import { DesktopMenu } from "./menu/desktop-menu";
import { PredictiveSearchButton } from "./predictive-search";
import { CartCount } from "./cart-count";

let variants = cva("", {
  variants: {
    width: {
      full: "w-full h-full",
      stretch: "w-full h-full",
      fixed: "w-full h-full max-w-page mx-auto",
    },
    padding: {
      full: "",
      stretch: "px-3 md:px-10 lg:px-16",
      fixed: "px-3 md:px-4 lg:px-6 mx-auto",
    },
  },
});

export function DesktopHeader() {
  let { enableTransparentHeader, headerWidth } = useThemeSettings();
  let isHome = useIsHomePath();
  let { y } = useWindowScroll();
  let routeError = useRouteError();

  let scrolled = y >= 50;
  let enableTransparent = enableTransparentHeader && isHome && !routeError;
  let isTransparent = enableTransparent && !scrolled;

  return (
    <header
      className={cn(
        "transition-all duration-300 ease-in-out",
        "hidden lg:block lg:w-full z-10",
        "bg-[--color-header-bg] hover:bg-[--color-header-bg]",
        "text-[--color-header-text] hover:text-[--color-header-text]",
        "border-b border-[rgb(230,230,230)]",
        variants({ padding: headerWidth }),
        scrolled ? "shadow-header" : "shadow-none",
        enableTransparent
          ? [
              "fixed top-[var(--topbar-height,var(--initial-topbar-height))] w-screen group/header",
              !scrolled &&
                "text-[--color-transparent-header-text] bg-transparent border-transparent",
            ]
          : "sticky top-0",
      )}
    >
      <div
        className={cn(
          "h-nav flex items-center justify-between gap-8",
          variants({ width: headerWidth }),
        )}
      >
        <Logo isTransparent={isTransparent} />
        <DesktopMenu />
        <div className="flex items-center gap-1 z-1">
          <PredictiveSearchButton />
          <AccountLink className="relative flex items-center justify-center w-8 h-8" />
          <CartCount
            isHome={isHome}
            openCart={() => {}}
            isTransparent={isTransparent}
          />
        </div>
      </div>
    </header>
  );
}

function AccountLink({ className }: { className?: string }) {
  let rootData = useRouteLoaderData<RootLoader>("root");
  let isLoggedIn = rootData?.isLoggedIn;

  return (
    <Link to="/account" className={className}>
      <Suspense fallback={<IconUser className="w-5 h-5" />}>
        <Await
          resolve={isLoggedIn}
          errorElement={<IconUser className="w-5 h-5" />}
        >
          {(isLoggedIn) =>
            isLoggedIn ? (
              <IconUser className="w-5 h-5" />
            ) : (
              <IconUser className="w-5 h-5" />
            )
          }
        </Await>
      </Suspense>
    </Link>
  );
}
