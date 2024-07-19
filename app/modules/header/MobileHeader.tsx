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
import {
  IconList,
  IconMagnifyingGlass,
  IconSignIn,
  IconUser,
} from "~/components/Icons";
import { useIsHomePath } from "~/lib/utils";
import type { RootLoader } from "~/root";
import { Logo } from "../Logo";
import { CartCount } from "./CartCount";

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
  let settings = useThemeSettings();
  let { y } = useWindowScroll();
  let enableTransparent = settings?.enableTransparentHeader && isHome;
  let isTransparent = enableTransparent && y < 50;
  let params = useParams();
  return (
    <header
      className={clsx(
        enableTransparent ? "fixed w-screen" : "sticky",
        isTransparent
          ? "bg-transparent text-primary"
          : "shadow-header text-body bg-primary",
        "transition-all duration-300 ease-in-out",
        "flex lg:hidden items-center h-nav z-40 top-0 justify-between w-full leading-none gap-4 px-4 md:px-8",
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
