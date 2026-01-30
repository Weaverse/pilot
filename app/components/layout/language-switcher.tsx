import {
  CaretDownIcon,
  CheckCircleIcon,
  GlobeIcon,
} from "@phosphor-icons/react";
import * as Popover from "@radix-ui/react-popover";
import { CartForm } from "@shopify/hydrogen";
import type { CartBuyerIdentityInput } from "@shopify/hydrogen/storefront-api-types";
import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import {
  useFetcher,
  useLocation,
  useRouteLoaderData,
} from "react-router";
import type { RootLoader } from "~/root";
import type { I18nLocale, Localizations } from "~/types/others";
import { cn } from "~/utils/cn";
import { DEFAULT_LOCALE } from "~/utils/const";

// Language labels and flags
const LANGUAGE_DATA: Record<string, { label: string; flag: string }> = {
  EN: { label: "English", flag: "🇺🇸" },
  VI: { label: "Tiếng Việt", flag: "🇻🇳" },
  ZH: { label: "中文", flag: "🇨🇳" },
  FR: { label: "Français", flag: "🇫🇷" },
  DE: { label: "Deutsch", flag: "🇩🇪" },
  ES: { label: "Español", flag: "🇪🇸" },
  IT: { label: "Italiano", flag: "🇮🇹" },
  JA: { label: "日本語", flag: "🇯🇵" },
  PT: { label: "Português", flag: "🇧🇷" },
  NL: { label: "Nederlands", flag: "🇳🇱" },
};

export function LanguageSwitcher() {
  const fetcher = useFetcher();
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation> --- IGNORE ---
  useEffect(() => {
    ref(observerRef.current);
  }, [ref, observerRef]);

  // Get available countries list when in view
  useEffect(() => {
    if (!inView || fetcher.data || fetcher.state === "loading") {
      return;
    }
    fetcher.load("/api/countries");
  }, [inView, fetcher]);

  // Get unique languages available for the current country
  const availableLanguages = Object.entries(countries)
    .filter(([, locale]) => locale.country === selectedLocale.country)
    .reduce(
      (acc, [path, locale]) => {
        if (!acc.some((l) => l.locale.language === locale.language)) {
          acc.push({ path, locale });
        }
        return acc;
      },
      [] as { path: string; locale: I18nLocale }[],
    );

  function handleLocaleChange({
    redirectTo,
    buyerIdentity,
  }: {
    redirectTo: string;
    buyerIdentity: CartBuyerIdentityInput;
  }) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/cart";

    const redirectToInput = document.createElement("input");
    redirectToInput.type = "hidden";
    redirectToInput.name = "redirectTo";
    redirectToInput.value = redirectTo;
    form.appendChild(redirectToInput);

    const cartFormInput = document.createElement("input");
    cartFormInput.type = "hidden";
    cartFormInput.name = "cartFormInput";
    cartFormInput.value = JSON.stringify({
      action: CartForm.ACTIONS.BuyerIdentityUpdate,
      inputs: { buyerIdentity },
    });
    form.appendChild(cartFormInput);

    document.body.appendChild(form);
    form.submit();
  }

  const currentLanguageData = LANGUAGE_DATA[selectedLocale.language] || {
    label: selectedLocale.language,
    flag: "🌐",
  };

  // Don't render if only one language is available
  if (availableLanguages.length <= 1 && !!fetcher.data) {
    return null;
  }

  return (
    <div ref={observerRef} className="flex items-center">
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1.5",
              "text-sm font-medium transition-colors cursor-pointer",
              "hover:bg-[rgb(var(--color-text)/0.05)]",
              "outline-hidden focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-text)/0.2)]",
            )}
            aria-label="Select language"
          >
            <GlobeIcon className="h-5 w-5" />
            <span className="hidden sm:inline">
              {currentLanguageData.label}
            </span>
            <span className="sm:hidden">{selectedLocale.language}</span>
            <CaretDownIcon className="h-3.5 w-3.5 opacity-60" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={8}
            align="end"
            className={cn(
              "z-50 min-w-[180px] overflow-hidden rounded-lg",
              "border border-line-subtle bg-(--color-background) shadow-lg",
              "animate-in fade-in-0 zoom-in-95",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            )}
          >
            <div className="py-1.5">
              {availableLanguages.length === 0 ? (
                <div className="px-4 py-2 text-sm opacity-50">Loading...</div>
              ) : (
                availableLanguages.map(({ path, locale }) => {
                  const isSelected =
                    locale.language === selectedLocale.language;
                  const langData = LANGUAGE_DATA[locale.language] || {
                    label: locale.language,
                    flag: "🌐",
                  };

                  return (
                    <Popover.Close
                      key={path}
                      type="button"
                      onClick={() =>
                        handleLocaleChange({
                          redirectTo: getLanguageUrlPath({
                            countryLocale: locale,
                            defaultLocalePrefix,
                            pathWithoutLocale,
                          }),
                          buyerIdentity: {
                            countryCode: locale.country,
                          },
                        })
                      }
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm cursor-pointer",
                        "transition-colors hover:bg-[rgb(var(--color-text)/0.05)]",
                        isSelected &&
                          "bg-[rgb(var(--color-text)/0.03)] font-semibold",
                      )}
                      aria-label={`Switch to ${langData.label}`}
                    >
                      <span className="text-lg leading-none">
                        {langData.flag}
                      </span>
                      <span className="flex-1">{langData.label}</span>
                      {isSelected && (
                        <CheckCircleIcon className="h-4.5 w-4.5 text-body" />
                      )}
                    </Popover.Close>
                  );
                })
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

function getLanguageUrlPath({
  countryLocale,
  defaultLocalePrefix,
  pathWithoutLocale,
}: {
  countryLocale: I18nLocale;
  pathWithoutLocale: string;
  defaultLocalePrefix: string;
}) {
  let countryPrefixPath = "";
  const countryLocalePrefix = `${countryLocale.language}-${countryLocale.country}`;
  if (countryLocalePrefix !== defaultLocalePrefix) {
    countryPrefixPath = `/${countryLocalePrefix.toLowerCase()}`;
  }
  return `${countryPrefixPath}${pathWithoutLocale}`;
}
