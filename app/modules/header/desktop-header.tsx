import {
  Await,
  Link,
  useLocation,
  useRouteError,
  useRouteLoaderData,
} from "@remix-run/react";
import { useThemeSettings } from "@weaverse/hydrogen";
import { cva } from "class-variance-authority";
import { Suspense, useEffect } from "react";
import useWindowScroll from "react-use/esm/useWindowScroll";
import { IconMagnifyingGlass, IconUser } from "~/components/icons";
import { Logo } from "~/components/logo";
import { cn } from "~/lib/cn";
import { type EnhancedMenu, useIsHomePath } from "~/lib/utils";
import { PredictiveSearch } from "~/modules/predictive-search";
import type { RootLoader } from "~/root";
import { Drawer, useDrawer } from "../drawer";
import { CartCount } from "./cart-count";
import { DesktopMenu } from "./menu/desktop-menu";

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

export function DesktopHeader({
  menu,
  openCart,
  shopName,
}: {
  openCart: () => void;
  menu?: EnhancedMenu;
  shopName: string;
}) {
  let { enableTransparentHeader, topbarHeight, headerWidth } =
    useThemeSettings();
  let isHome = useIsHomePath();
  let { y } = useWindowScroll();
  let { isOpen, openDrawer, closeDrawer } = useDrawer();
  let routeError = useRouteError();

  let scrolled = y >= 50;
  let enableTransparent = enableTransparentHeader && isHome && !routeError;
  let isTransparent = enableTransparent && !scrolled;

  return (
    <header
      style={
        {
          "--initial-topbar-height": `${topbarHeight}px`,
        } as React.CSSProperties
      }
      className={cn(
        "transition-colors duration-300 ease-in-out",
        "hidden lg:block lg:w-full z-10",
        "bg-[--color-header-bg] hover:bg-[--color-header-bg]",
        "border-b border-[rgb(230,230,230)]",
        variants({ padding: headerWidth }),
        scrolled && "shadow-header",
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
          "h-nav flex items-center justify-between leading-none gap-8",
          "text-[--color-header-text] hover:text-[--color-header-text]",
          variants({ width: headerWidth }),
        )}
      >
        <Logo isTransparent={isTransparent} shopName={shopName} />
        {menu && <DesktopMenu menu={menu} />}
        <div className="flex items-center gap-1 z-1">
          <SearchToggle
            isOpen={isOpen}
            openDrawer={openDrawer}
            closeDrawer={closeDrawer}
          />
          <AccountLink className="relative flex items-center justify-center w-8 h-8 focus:ring-body/5" />
          <CartCount
            isHome={isHome}
            openCart={openCart}
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

function SearchToggle({
  isOpen,
  openDrawer,
  closeDrawer,
}: {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}) {
  let { pathname } = useLocation();
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (isOpen) {
      closeDrawer();
    }
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={openDrawer}
        className="relative flex h-8 w-8 items-center justify-center"
      >
        <IconMagnifyingGlass className="w-5 h-5" />
      </button>
      <Drawer open={isOpen} onClose={closeDrawer} openFrom="top">
        <PredictiveSearch isOpen={isOpen} />
      </Drawer>
    </>
  );
}
