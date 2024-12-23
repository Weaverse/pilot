import { useLocation, useRouteLoaderData } from "@remix-run/react";
import type { FulfillmentStatus } from "@shopify/hydrogen/customer-account-api-types";
import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";
import type { LinkHTMLAttributes } from "react";

import { countries } from "~/data/countries";
import type { RootLoader } from "~/root";
import type { I18nLocale } from "./type";

export function getExcerpt(text: string) {
  const regex = /<p.*>(.*?)<\/p>/;
  const match = regex.exec(text);
  return match?.length ? match[0] : text;
}

export function isNewArrival(date: string, daysOld = 30) {
  return (
    new Date(date).valueOf() >
    new Date().setDate(new Date().getDate() - daysOld).valueOf()
  );
}

export function isDiscounted(price: MoneyV2, compareAtPrice: MoneyV2) {
  if (compareAtPrice?.amount > price?.amount) {
    return true;
  }
  return false;
}

export function statusMessage(status: FulfillmentStatus) {
  const translations: Record<FulfillmentStatus, string> = {
    SUCCESS: "Success",
    PENDING: "Pending",
    OPEN: "Open",
    FAILURE: "Failure",
    ERROR: "Error",
    CANCELLED: "Cancelled",
  };
  try {
    return translations?.[status];
  } catch (error) {
    return status;
  }
}

export const DEFAULT_LOCALE: I18nLocale = Object.freeze({
  ...countries.default,
  pathPrefix: "",
});

export function getLocaleFromRequest(request: Request): I18nLocale {
  let url = new URL(request.url);
  let firstPathPart = `/${url.pathname.substring(1).split("/")[0].toLowerCase()}`;

  return countries[firstPathPart]
    ? {
        ...countries[firstPathPart],
        pathPrefix: firstPathPart,
      }
    : {
        ...countries.default,
        pathPrefix: "",
      };
}

export function usePrefixPathWithLocale(path: string) {
  let rootData = useRouteLoaderData<RootLoader>("root");
  let selectedLocale = rootData?.selectedLocale ?? DEFAULT_LOCALE;

  return `${selectedLocale.pathPrefix}${
    path.startsWith("/") ? path : `/${path}`
  }`;
}

export function useIsHomePath() {
  let { pathname } = useLocation();
  let rootData = useRouteLoaderData<RootLoader>("root");
  let selectedLocale = rootData?.selectedLocale ?? DEFAULT_LOCALE;
  let strippedPathname = pathname.replace(selectedLocale.pathPrefix, "");
  return strippedPathname === "/";
}

export function parseAsCurrency(value: number, locale: I18nLocale) {
  return new Intl.NumberFormat(`${locale.language}-${locale.country}`, {
    style: "currency",
    currency: locale.currency,
  }).format(value);
}

/**
 * Validates that a url is local
 * @param url
 * @returns `true` if local `false`if external domain
 */
export function isLocalPath(url: string) {
  try {
    // We don't want to redirect cross domain,
    // doing so could create fishing vulnerability
    // If `new URL()` succeeds, it's a fully qualified
    // url which is cross domain. If it fails, it's just
    // a path, which will be the current domain.
    new URL(url);
  } catch (e) {
    return true;
  }

  return false;
}

export function getImageAspectRatio(
  image: {
    width?: number | null;
    height?: number | null;
    [key: string]: any;
  },
  aspectRatio: string,
) {
  if (aspectRatio === "adapt") {
    if (image?.width && image?.height) {
      return `${image.width}/${image.height}`;
    }
    return "1/1";
  }
  return aspectRatio;
}

export function loadCSS(attrs: LinkHTMLAttributes<HTMLLinkElement>) {
  return new Promise((resolve, reject) => {
    let found = document.querySelector(`link[href="${attrs.href}"]`);
    if (found) {
      return resolve(true);
    }
    let link = document.createElement("link");
    Object.assign(link, attrs);
    link.addEventListener("load", () => resolve(true));
    link.onerror = reject;
    document.head.appendChild(link);
  });
}
