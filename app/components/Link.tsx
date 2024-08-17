import {
  Link as RemixLink,
  type LinkProps as RemixLinkProps,
  NavLink as RemixNavLink,
  type NavLinkProps as RemixNavLinkProps,
  useRouteLoaderData,
} from "@remix-run/react";
import { useThemeSettings } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { RootLoader } from "~/root";

type LinkProps = RemixLinkProps | RemixNavLinkProps;

/**
 * In our app, we've chosen to wrap Remix's `Link` component to add
 * helper functionality. If the `to` value is a string (not object syntax),
 * we prefix the locale to the path if there is one.
 *
 * You could implement the same behavior throughout your app using the
 * Remix-native nested routes. However, your route and component structure
 * changes the level of nesting required to get the locale into the route,
 * which may not be ideal for shared components or layouts.
 *
 * Likewise, your internationalization strategy may not require a locale
 * in the pathname and instead rely on a domain, cookie, or header.
 *
 * Ultimately, it is up to you to decide how to implement this behavior.
 */
export let Link = forwardRef(
  (props: LinkProps | RemixNavLinkProps, ref: React.Ref<HTMLAnchorElement>) => {
    let { to, className, ...resOfProps } = props;
    let rootData = useRouteLoaderData<RootLoader>("root");
    let { enableViewTransition } = useThemeSettings();
    let selectedLocale = rootData?.selectedLocale;

    let toWithLocale = to;

    if (typeof toWithLocale === "string" && selectedLocale?.pathPrefix) {
      if (!toWithLocale.toLowerCase().startsWith(selectedLocale.pathPrefix)) {
        toWithLocale = `${selectedLocale.pathPrefix}${to}`;
      }
    }

    if (
      typeof className === "function" ||
      typeof resOfProps.children === "function"
    ) {
      return (
        <RemixNavLink
          ref={ref}
          unstable_viewTransition={enableViewTransition}
          to={toWithLocale}
          className={className}
          {...resOfProps}
        />
      );
    }

    return (
      // @ts-ignore
      <RemixLink
        ref={ref}
        unstable_viewTransition={enableViewTransition}
        to={toWithLocale}
        className={className}
        {...resOfProps}
      />
    );
  },
);
