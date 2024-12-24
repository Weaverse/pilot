import { CaretDown, CheckCircle } from "@phosphor-icons/react";
import * as Popover from "@radix-ui/react-popover";
import {
  useFetcher,
  useLocation,
  useRouteLoaderData,
  useSubmit,
} from "@remix-run/react";
import { CartForm } from "@shopify/hydrogen";
import type { CartBuyerIdentityInput } from "@shopify/hydrogen/storefront-api-types";
import { useEffect, useRef } from "react";
import ReactCountryFlag from "react-country-flag";
import { useInView } from "react-intersection-observer";
import { DEFAULT_LOCALE } from "~/utils/const";
import type { RootLoader } from "~/root";
import type { Locale, Localizations } from "~/types/locale";

export function CountrySelector() {
  let fetcher = useFetcher();
  let submit = useSubmit();
  let rootData = useRouteLoaderData<RootLoader>("root");
  let selectedLocale = rootData?.selectedLocale ?? DEFAULT_LOCALE;
  let { pathname, search } = useLocation();
  let pathWithoutLocale = `${pathname.replace(
    selectedLocale.pathPrefix,
    ""
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
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className="w-full border border-line-subtle overflow-clip px-4 py-3 cursor-pointer text-left outline-none flex items-center gap-2"
            aria-label="Select country"
          >
            <ReactCountryFlag
              svg
              countryCode={selectedLocale.country}
              style={{ width: "24px", height: "14px" }}
            />
            <span>{selectedLocale.label}</span>
            <CaretDown className="ml-auto w-4 h-4" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content>
            <div className="w-80 max-h-40 overflow-auto py-2 bg-neutral-800 my-2">
              {countries &&
                Object.keys(countries).map((countryPath) => {
                  let countryLocale = countries[countryPath];
                  let isSelected =
                    countryLocale.language === selectedLocale.language &&
                    countryLocale.country === selectedLocale.country;

                  return (
                    <Popover.Close
                      aria-label={`Select ${countryLocale.label} country`}
                      key={countryPath}
                      type="button"
                      onClick={() =>
                        handleLocaleChange({
                          redirectTo: getCountryUrlPath({
                            countryLocale,
                            defaultLocalePrefix,
                            pathWithoutLocale,
                          }),
                          buyerIdentity: {
                            countryCode: countryLocale.country,
                          },
                        })
                      }
                      className="text-white bg-neutral-800 hover:bg-neutral-600 w-full p-2 transition flex gap-2 items-center text-left cursor-pointer py-2 px-4 text-sm"
                    >
                      <ReactCountryFlag
                        svg
                        countryCode={countryLocale.country}
                        style={{ width: "24px", height: "14px" }}
                      />
                      <span>{countryLocale.label}</span>
                      {isSelected ? (
                        <span className="ml-auto">
                          <CheckCircle className="w-5 h-5" />
                        </span>
                      ) : null}
                    </Popover.Close>
                  );
                })}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

function getCountryUrlPath({
  countryLocale,
  defaultLocalePrefix,
  pathWithoutLocale,
}: {
  countryLocale: Locale;
  pathWithoutLocale: string;
  defaultLocalePrefix: string;
}) {
  let countryPrefixPath = "";
  let countryLocalePrefix = `${countryLocale.language}-${countryLocale.country}`;
  if (countryLocalePrefix !== defaultLocalePrefix) {
    countryPrefixPath = `/${countryLocalePrefix.toLowerCase()}`;
  }
  return `${countryPrefixPath}${pathWithoutLocale}`;
}
