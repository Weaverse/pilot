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
import { IconCaretDown } from "~/components/Icons";
import { getCountryUrlPath } from "~/lib/locale";
import type { Localizations } from "~/lib/type";
import { DEFAULT_LOCALE } from "~/lib/utils";
import type { RootLoader } from "~/root";
import { IconCheck } from "./Icon";

export function CountrySelector() {
  const fetcher = useFetcher();
  const submit = useSubmit();
  const rootData = useRouteLoaderData<RootLoader>("root");
  const selectedLocale = rootData?.selectedLocale ?? DEFAULT_LOCALE;
  const { pathname, search } = useLocation();
  const pathWithoutLocale = `${pathname.replace(
    selectedLocale.pathPrefix,
    ""
  )}${search}`;

  const countries = (fetcher.data ?? {}) as Localizations;
  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  const defaultLocale = countries?.["default"];
  const defaultLocalePrefix = defaultLocale
    ? `${defaultLocale?.language}-${defaultLocale?.country}`
    : "";

  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  const observerRef = useRef(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    ref(observerRef.current);
  }, [ref, observerRef]);

  // Get available countries list when in view
  useEffect(() => {
    if (!inView || fetcher.data || fetcher.state === "loading") return;
    fetcher.load("/api/countries");
  }, [inView, fetcher]);

  const handleLocaleChange = ({
    redirectTo,
    buyerIdentity,
  }: {
    redirectTo: string;
    buyerIdentity: CartBuyerIdentityInput;
  }) => {
    const cartFormInput = {
      action: CartForm.ACTIONS.BuyerIdentityUpdate,
      inputs: { buyerIdentity },
    };
    const formData = {
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
        <PopoverButton className="w-full border border-contrast/30 overflow-clip px-4 py-3 cursor-pointer text-left outline-none flex items-center justify-between gap-2">
          {selectedLocale.label}
          <IconCaretDown className="w-5 h-5" />
        </PopoverButton>
        <PopoverBackdrop className="bg-black/30" />
        <PopoverPanel anchor="top">
          <div className="w-80 max-h-40 overflow-auto py-2 rounded bg-black my-2">
            {countries &&
              Object.keys(countries).map((countryPath) => {
                const countryLocale = countries[countryPath];
                const isSelected =
                  countryLocale.language === selectedLocale.language &&
                  countryLocale.country === selectedLocale.country;

                const countryUrlPath = getCountryUrlPath({
                  countryLocale,
                  defaultLocalePrefix,
                  pathWithoutLocale,
                });
                const onChangeLocale = () =>
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
                    className="text-white bg-black hover:bg-primary/30 w-full p-2 transition flex justify-start items-center text-left cursor-pointer py-2 px-4 text-sm"
                  >
                    {countryLocale.label}
                    {isSelected ? (
                      <span className="ml-2">
                        <IconCheck />
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
