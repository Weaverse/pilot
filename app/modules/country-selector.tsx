import {
  useFetcher,
  useLocation,
  useRouteLoaderData,
  useSubmit,
} from "@remix-run/react";
import { CartForm } from "@shopify/hydrogen";
import type { CartBuyerIdentityInput } from "@shopify/hydrogen/storefront-api-types";
import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

import {
  CloseButton,
  Popover,
  PopoverBackdrop,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
import { IconCaretDown, IconCheckCircle } from "~/components/icons";
import { getCountryUrlPath } from "~/lib/locale";
import type { Localizations } from "~/lib/type";
import { DEFAULT_LOCALE } from "~/lib/utils";
import type { RootLoader } from "~/root";
import ReactCountryFlag from "react-country-flag";

export function CountrySelector() {
  let fetcher = useFetcher();
  let submit = useSubmit();
  let rootData = useRouteLoaderData<RootLoader>("root");
  let selectedLocale = rootData?.selectedLocale ?? DEFAULT_LOCALE;
  let { pathname, search } = useLocation();
  let pathWithoutLocale = `${pathname.replace(
    selectedLocale.pathPrefix,
    "",
  )}${search}`;

  let countries = (fetcher.data ?? {}) as Localizations;
  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  let defaultLocale = countries?.["default"];
  let defaultLocalePrefix = defaultLocale
    ? `${defaultLocale?.language}-${defaultLocale?.country}`
    : "";

  let { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  let observerRef = useRef(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    ref(observerRef.current);
  }, [ref, observerRef]);

  // Get available countries list when in view
  useEffect(() => {
    if (!inView || fetcher.data || fetcher.state === "loading") return;
    fetcher.load("/api/countries");
  }, [inView, fetcher]);

  let handleLocaleChange = ({
    redirectTo,
    buyerIdentity,
  }: {
    redirectTo: string;
    buyerIdentity: CartBuyerIdentityInput;
  }) => {
    let cartFormInput = {
      action: CartForm.ACTIONS.BuyerIdentityUpdate,
      inputs: { buyerIdentity },
    };
    let formData = {
      redirectTo,
      cartFormInput: JSON.stringify(cartFormInput),
    };
    submit(formData, {
      method: "POST",
      action: "/cart",
    });
  };

  return (
    <div ref={observerRef} className="grid gap-4 w-80">
      <Popover>
        <PopoverButton className="w-full border border-line/75 overflow-clip px-4 py-3 cursor-pointer text-left outline-none flex items-center gap-2">
          <ReactCountryFlag
            svg
            countryCode={selectedLocale.country}
            style={{ width: "24px", height: "14px" }}
          />
          <span>{selectedLocale.label}</span>
          <IconCaretDown className="ml-auto w-4 h-4" />
        </PopoverButton>
        <PopoverBackdrop className="bg-black/30" />
        <PopoverPanel anchor="top">
          <div className="w-80 max-h-40 overflow-auto py-2 bg-neutral-800 my-2">
            {countries &&
              Object.keys(countries).map((countryPath) => {
                let countryLocale = countries[countryPath];
                let isSelected =
                  countryLocale.language === selectedLocale.language &&
                  countryLocale.country === selectedLocale.country;

                let countryUrlPath = getCountryUrlPath({
                  countryLocale,
                  defaultLocalePrefix,
                  pathWithoutLocale,
                });
                let onChangeLocale = () =>
                  handleLocaleChange({
                    redirectTo: countryUrlPath,
                    buyerIdentity: {
                      countryCode: countryLocale.country,
                    },
                  });
                return (
                  <CloseButton
                    as="button"
                    key={countryPath}
                    type="button"
                    onClick={onChangeLocale}
                    className="text-white bg-neutral-800 hover:bg-background/30 w-full p-2 transition flex gap-2 items-center text-left cursor-pointer py-2 px-4 text-sm"
                  >
                    <ReactCountryFlag
                      svg
                      countryCode={countryLocale.country}
                      style={{ width: "24px", height: "14px" }}
                    />
                    <span>{countryLocale.label}</span>
                    {isSelected ? (
                      <span className="ml-auto">
                        <IconCheckCircle className="w-5 h-5" />
                      </span>
                    ) : null}
                  </CloseButton>
                );
              })}
          </div>
        </PopoverPanel>
      </Popover>
    </div>
  );
}
