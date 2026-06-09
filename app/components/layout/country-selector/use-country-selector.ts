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
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { RootLoader } from "~/root";
import type { I18nLocale, Localizations } from "~/types/others";
import { DEFAULT_LOCALE } from "~/utils/const";

export type CountryGroup = {
  country: string;
  label: string;
  locales: Array<{ path: string; locale: I18nLocale }>;
};

export function useCountrySelector() {
  const fetcher = useFetcher();
  const submit = useSubmit();
  const rootData = useRouteLoaderData<RootLoader>("root");
  const selectedLocale = rootData?.selectedLocale ?? DEFAULT_LOCALE;
  const { pathname, search } = useLocation();
  const cartRoute = usePrefixPathWithLocale("/cart");
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
      { method: "POST", action: cartRoute },
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

  const groupedCountries: CountryGroup[] = [];
  const groupIndex: Record<string, number> = {};
  for (const path of Object.keys(countries)) {
    const locale = countries[path];
    const key = locale.country;
    if (groupIndex[key] === undefined) {
      groupIndex[key] = groupedCountries.length;
      groupedCountries.push({
        country: locale.country,
        label: locale.label,
        locales: [],
      });
    }
    groupedCountries[groupIndex[key]].locales.push({ path, locale });
  }
  for (const group of groupedCountries) {
    group.locales.sort((a, b) => {
      if (a.locale.language === "EN" && b.locale.language !== "EN") {
        return 1;
      }
      if (a.locale.language !== "EN" && b.locale.language === "EN") {
        return -1;
      }
      return 0;
    });
  }

  return {
    selectedLocale,
    countries,
    groupedCountries,
    observerRef,
    handleLocaleChange,
    getRedirectUrl,
  };
}
