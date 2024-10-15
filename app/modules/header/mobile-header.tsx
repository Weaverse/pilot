import {
  Await,
  Form,
  Link,
  useParams,
  useRouteLoaderData,
} from "@remix-run/react";
import { useThemeSettings } from "@weaverse/hydrogen";
import { Suspense } from "react";
import useWindowScroll from "react-use/esm/useWindowScroll";
import { IconList, IconMagnifyingGlass, IconUser } from "~/components/icons";
import { Logo } from "~/components/logo";
import { cn } from "~/lib/cn";
import { useIsHomePath } from "~/lib/utils";
import type { RootLoader } from "~/root";
import { CartCount } from "./cart-count";

export function MobileHeader({
  shopName,
  openCart,
  openMenu,
}: {
  shopName: string;
  openCart: () => void;
  openMenu: () => void;
}) {
  // useHeaderStyleFix(containerStyle, setContainerStyle, isHome);
  let isHome = useIsHomePath();
  let { enableTransparentHeader, topbarHeight } = useThemeSettings();
  let { y } = useWindowScroll();
  let params = useParams();
  let scrolled = y >= 50;
  let isTransparent = enableTransparentHeader && isHome && !scrolled;

  return (
    <header
      style={
        {
          "--initial-topbar-height": `${topbarHeight}px`,
        } as React.CSSProperties
      }
      className={cn(
        "transition-colors duration-300 ease-in-out",
        "h-nav z-40 top-[var(--topbar-height,var(--initial-topbar-height))] w-full leading-none",
        "flex lg:hidden justify-between items-center gap-4",
        "px-3 md:px-10",
        "text-[var(--color-header-text)] bg-[var(--color-header-bg)]",
        "hover:text-[var(--color-header-text)] hover:bg-[var(--color-header-bg)]",
        scrolled && "shadow-header",
        enableTransparentHeader && isHome
          ? [
              "fixed top-[var(--topbar-height,var(--initial-topbar-height))] w-screen group/header",
              !scrolled &&
                "text-[var(--color-transparent-header-text)] bg-transparent border-transparent",
            ]
          : "sticky top-0"
      )}
    >
      <div className="flex items-center justify-start w-full">
        <button
          type="button"
          onClick={openMenu}
          className="relative flex items-center justify-center w-8 h-8"
        >
          <IconList className="w-5 h-5" />
        </button>
        <Form
          method="get"
          action={params.locale ? `/${params.locale}/search` : "/search"}
          className="items-center gap-2 sm:flex"
        >
          <button
            type="submit"
            className="relative flex items-center justify-center w-8 h-8"
          >
            <IconMagnifyingGlass className="w-5 h-5" />
          </button>
        </Form>
      </div>
      <Logo isTransparent={isTransparent} shopName={shopName} />
      <div className="flex items-center justify-end w-full">
        <AccountLink className="relative flex items-center justify-center w-8 h-8" />
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
