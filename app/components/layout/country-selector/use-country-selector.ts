import { CartForm } from "@shopify/hydrogen";
import { useLocation, useRouteLoaderData } from "react-router";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { RootLoader } from "~/root";
import {
  DEFAULT_LOCALE,
  delocalizePath,
  type Locale,
  localizePath,
  resolveLocale,
  SUPPORTED_LOCALES,
} from "~/utils/locale";

export type CountryGroup = {
  country: string;
  label: string;
  locales: Locale[];
};

/**
 * Markets grouped by country, English last within a country so a market's own
 * language leads the list.
 */
const COUNTRY_GROUPS: CountryGroup[] = (() => {
  const groups: CountryGroup[] = [];
  for (const locale of SUPPORTED_LOCALES) {
    const group = groups.find((item) => item.country === locale.country);
    if (group) {
      group.locales.push(locale);
    } else {
      groups.push({
        country: locale.country,
        label: locale.label,
        locales: [locale],
      });
    }
  }
  for (const group of groups) {
    group.locales.sort(
      (a, b) => Number(a.language === "EN") - Number(b.language === "EN"),
    );
  }
  return groups;
})();

export function useCountrySelector() {
  const rootData = useRouteLoaderData<RootLoader>("root");
  const { pathname, search } = useLocation();
  const cartRoute = usePrefixPathWithLocale("/cart");
  const selectedLocale =
    rootData?.selectedLocale ?? resolveLocale(pathname) ?? DEFAULT_LOCALE;

  return {
    selectedLocale,
    cartRoute,
    groupedCountries: COUNTRY_GROUPS,
    /**
     * The same page in another market. Query is preserved so an active filter
     * or search survives the switch.
     */
    getRedirectUrl(locale: Locale) {
      return localizePath(delocalizePath(pathname) + search, locale);
    },
    buyerIdentityInput(locale: Locale) {
      return JSON.stringify({
        action: CartForm.ACTIONS.BuyerIdentityUpdate,
        inputs: { buyerIdentity: { countryCode: locale.country } },
      });
    },
  };
}
