import { Await, Link, useLocation, useRouteLoaderData } from "@remix-run/react";
import { useThemeSettings } from "@weaverse/hydrogen";
import clsx from "clsx";
import { Suspense, useEffect, useState } from "react";
import useWindowScroll from "react-use/esm/useWindowScroll";
import { IconMagnifyingGlass, IconSignIn, IconUser } from "~/components/Icons";
import { PredictiveSearch } from "~/components/predictive-search/PredictiveSearch";
import { useIsHomePath, type EnhancedMenu } from "~/lib/utils";
import type { RootLoader } from "~/root";
import { Drawer, useDrawer } from "../Drawer";
import { Logo } from "../Logo";
import { CartCount } from "./CartCount";
import { DesktopMenu } from "./menu/DesktopMenu";

export function DesktopHeader({
  menu,
  openCart,
  title,
}: {
  openCart: () => void;
  menu?: EnhancedMenu;
  title: string;
}) {
  let settings = useThemeSettings();
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

  let enableTransparent = settings?.enableTransparentHeader && isHome;
  let isTransparent = enableTransparent && y < 50 && !hovered;

  return (
    <header
      className={clsx(
        enableTransparent ? "fixed w-screen group/header" : "sticky",
        isTransparent
          ? "text-primary bg-transparent"
          : "shadow-header text-body bg-primary",
        "hover:text-body hover:bg-primary",
        "transition-all duration-300 ease-in-out",
        "h-nav hidden lg:flex items-center z-40 top-0 justify-between leading-none gap-8",
        "px-6 md:px-8 lg:px-12",
      )}
    >
      <Logo showTransparent={isTransparent} />
      {menu && <DesktopMenu menu={menu} />}
      <div className="flex items-center gap-1 z-30">
        <SearchToggle
          isOpen={isOpen}
          openDrawer={openDrawer}
          closeDrawer={closeDrawer}
        />
        <AccountLink className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5" />
        <CartCount isHome={isHome} openCart={openCart} />
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
