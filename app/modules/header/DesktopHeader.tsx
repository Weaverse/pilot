import { Await, Link, useLocation, useRouteLoaderData } from "@remix-run/react";
import { useThemeSettings } from "@weaverse/hydrogen";
import { Suspense, useEffect, useState } from "react";
import useWindowScroll from "react-use/esm/useWindowScroll";
import { IconMagnifyingGlass, IconSignIn, IconUser } from "~/components/Icons";
import { PredictiveSearch } from "~/components/predictive-search/PredictiveSearch";
import { cn } from "~/lib/cn";
import { type EnhancedMenu, useIsHomePath } from "~/lib/utils";
import type { RootLoader } from "~/root";
import { Drawer, useDrawer } from "../Drawer";
import { Logo } from "../Logo";
import { CartCount } from "./CartCount";
import { DesktopMenu } from "./menu/DesktopMenu";

export function DesktopHeader({
  menu,
  openCart,
  shopName,
}: {
  openCart: () => void;
  menu?: EnhancedMenu;
  shopName: string;
}) {
  let { enableTransparentHeader } = useThemeSettings();
  let isHome = useIsHomePath();
  let { y } = useWindowScroll();
  let [hovered, setHovered] = useState(false); // use state to delay disappearing header when drawer closes
  let { isOpen, openDrawer, closeDrawer } = useDrawer();

  useEffect(() => {
    if (isOpen) {
      setHovered(true);
    } else {
      setTimeout(() => {
        setHovered(false);
      }, 200);
    }
  }, [isOpen]);

  let scrolled = y >= 50;
  let isTransparent =
    enableTransparentHeader && isHome && !scrolled && !hovered;

  return (
    <header
      className={cn(
        "hover:text-body hover:bg-primary",
        "transition-all duration-300 ease-in-out",
        "h-nav hidden lg:flex items-center z-40 top-0 justify-between leading-none gap-8",
        "px-6 md:px-8 lg:px-12",
        "text-body bg-primary",
        "border-b border-header",
        scrolled && "shadow-header",
        enableTransparentHeader && isHome
          ? [
              "fixed w-screen group/header",
              !scrolled &&
                !hovered &&
                "text-primary bg-transparent border-transparent",
            ]
          : "sticky",
      )}
    >
      <Logo isTransparent={isTransparent} shopName={shopName} />
      {menu && <DesktopMenu menu={menu} />}
      <div className="flex items-center gap-1 z-30">
        <SearchToggle
          isOpen={isOpen}
          openDrawer={openDrawer}
          closeDrawer={closeDrawer}
        />
        <AccountLink className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5" />
        <CartCount
          isHome={isHome}
          openCart={openCart}
          isTransparent={isTransparent}
        />
      </div>
    </header>
  );
}

function AccountLink({ className }: { className?: string }) {
  let rootData = useRouteLoaderData<RootLoader>("root");
  let isLoggedIn = rootData?.isLoggedIn;

  return (
    <Link to="/account" className={className}>
      <Suspense fallback={<IconSignIn className="w-5 h-5" />}>
        <Await
          resolve={isLoggedIn}
          errorElement={<IconUser className="w-5 h-5" />}
        >
          {(isLoggedIn) =>
            isLoggedIn ? (
              <IconUser className="w-5 h-5" />
            ) : (
              <IconSignIn className="w-5 h-5" />
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
        className="relative flex h-8 w-8 items-center justify-center focus:ring-primary/5"
      >
        <IconMagnifyingGlass className="w-5 h-5" />
      </button>
      <Drawer open={isOpen} onClose={closeDrawer} openFrom="top">
        <PredictiveSearch isOpen={isOpen} />
      </Drawer>
    </>
  );
}
