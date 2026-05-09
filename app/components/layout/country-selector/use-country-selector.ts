import { CartForm } from "@shopify/hydrogen";
import type { CartBuyerIdentityInput } from "@shopify/hydrogen/storefront-api-types";
import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import {
  useFetcher,
  useLocation,
  useRouteLoaderData,
  useSubmit,
} from "react-router";
import type { RootLoader } from "~/root";
import type { I18nLocale, Localizations } from "~/types/others";
import { DEFAULT_LOCALE } from "~/utils/const";

export function useCountrySelector() {
  const fetcher = useFetcher();
  const submit = useSubmit();
  const rootData = useRouteLoaderData<RootLoader>("root");
  const selectedLocale = rootData?.selectedLocale ?? DEFAULT_LOCALE;
  const { pathname, search } = useLocation();
  const pathWithoutLocale = `${pathname.replace(
    selectedLocale.pathPrefix,
    "",
  )}${search}`;

  const countries = (fetcher.data ?? {}) as Localizations;
  const defaultLocale = countries?.default;
  const defaultLocalePrefix = defaultLocale
    ? `${defaultLocale?.language}-${defaultLocale?.country}`
    : "";

  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  const observerRef = useRef(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: ref callback from useInView
  useEffect(() => {
    ref(observerRef.current);
  }, [ref, observerRef]);

  useEffect(() => {
    if (!inView || fetcher.data || fetcher.state === "loading") {
      return;
    }
    fetcher.load("/api/countries");
  }, [inView, fetcher]);

  function handleLocaleChange({
    redirectTo,
    buyerIdentity,
  }: {
    redirectTo: string;
    buyerIdentity: CartBuyerIdentityInput;
  }) {
    submit(
      {
        redirectTo,
        cartFormInput: JSON.stringify({
          action: CartForm.ACTIONS.BuyerIdentityUpdate,
          inputs: { buyerIdentity },
        }),
      },
      { method: "POST", action: "/cart" },
    );
  }

  function getRedirectUrl(countryLocale: I18nLocale) {
    let countryPrefixPath = "";
    const countryLocalePrefix = `${countryLocale.language}-${countryLocale.country}`;
    if (countryLocalePrefix !== defaultLocalePrefix) {
      countryPrefixPath = `/${countryLocalePrefix.toLowerCase()}`;
    }
    return `${countryPrefixPath}${pathWithoutLocale}`;
  }

  return {
    selectedLocale,
    countries,
    observerRef,
    handleLocaleChange,
    getRedirectUrl,
  };
}
