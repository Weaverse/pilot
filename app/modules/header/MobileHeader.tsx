import {
  Await,
  Form,
  Link,
  useParams,
  useRouteLoaderData,
} from "@remix-run/react";
import { useThemeSettings } from "@weaverse/hydrogen";
import clsx from "clsx";
import { Suspense } from "react";
import useWindowScroll from "react-use/esm/useWindowScroll";
import type { RootLoader } from "~/root";
import { IconAccount, IconLogin, IconMenu, IconSearch } from "../Icon";
import { Logo } from "../Logo";
import { CartCount } from "./CartCount";

export function MobileHeader({
  title,
  isHome,
  openCart,
  openMenu,
}: {
  title: string;
  isHome: boolean;
  openCart: () => void;
  openMenu: () => void;
}) {
  // useHeaderStyleFix(containerStyle, setContainerStyle, isHome);
  let settings = useThemeSettings();
  const { y } = useWindowScroll();
  let enableTransparent = settings?.enableTransparentHeader && isHome;
  let isTransparent = enableTransparent && y < 50;
  const params = useParams();
  return (
    <header
      role="banner"
      className={clsx(
        enableTransparent ? "fixed w-screen" : "sticky",
        isTransparent
          ? "bg-transparent text-primary"
          : "shadow-header text-body bg-primary",
        "transition-all duration-300 ease-in-out",
        "flex lg:hidden items-center h-nav z-40 top-0 justify-between w-full leading-none gap-4 px-4 md:px-8",
      )}
    >
      <div className="flex items-center justify-start w-full gap-4">
        <button
          onClick={openMenu}
          className="relative flex items-center justify-center w-8 h-8"
        >
          <IconMenu />
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
            <IconSearch />
          </button>
        </Form>
      </div>

      <Logo showTransparent={isTransparent} />

      <div className="flex items-center justify-end w-full gap-4">
        <AccountLink className="relative flex items-center justify-center w-8 h-8" />
        <CartCount isHome={isHome} openCart={openCart} />
      </div>
    </header>
  );
}

function AccountLink({ className }: { className?: string }) {
  const rootData = useRouteLoaderData<RootLoader>("root");
  const isLoggedIn = rootData?.isLoggedIn;

  return (
    <Link to="/account" className={className}>
      <Suspense fallback={<IconLogin />}>
        <Await resolve={isLoggedIn} errorElement={<IconAccount />}>
          {(isLoggedIn) => (isLoggedIn ? <IconAccount /> : <IconAccount />)}
        </Await>
      </Suspense>
    </Link>
  );
}
