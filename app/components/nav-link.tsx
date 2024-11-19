import {
  NavLink as RemixNavLink,
  type NavLinkProps as RemixNavLinkProps,
  useRouteLoaderData,
} from "@remix-run/react";
import { useThemeSettings } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { RootLoader } from "~/root";

export let NavLink = forwardRef(
  (props: RemixNavLinkProps, ref: React.Ref<HTMLAnchorElement>) => {
    let { to, className, ...rest } = props;
    let rootData = useRouteLoaderData<RootLoader>("root");
    let { enableViewTransition } = useThemeSettings();
    let selectedLocale = rootData?.selectedLocale;

    let toWithLocale = to;
    if (typeof toWithLocale === "string" && selectedLocale?.pathPrefix) {
      if (!toWithLocale.toLowerCase().startsWith(selectedLocale.pathPrefix)) {
        toWithLocale = `${selectedLocale.pathPrefix}${to}`;
      }
    }

    return (
      <RemixNavLink
        ref={ref}
        viewTransition={enableViewTransition}
        to={toWithLocale}
        className={className}
        {...rest}
      />
    );
  },
);
