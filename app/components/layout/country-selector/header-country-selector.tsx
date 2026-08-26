import * as Popover from "@radix-ui/react-popover";
import { useThemeSettings } from "@weaverse/hydrogen";
import { Fragment } from "react";
import ReactCountryFlag from "react-country-flag";
import { Icon } from "~/components/icon";
import { ScrollArea } from "~/components/scroll-area";
import type { ThemeSettings } from "~/types/weaverse";
import { cn } from "~/utils/cn";
import { LANGUAGE_LABELS } from "~/utils/const";
import { useCountrySelector } from "./use-country-selector";

export function HeaderCountrySelector() {
  const {
    selectedLocale,
    groupedCountries,
    observerRef,
    handleLocaleChange,
    getRedirectUrl,
  } = useCountrySelector();
  const { countryNameDisplay } = useThemeSettings<ThemeSettings>();

  return (
    <div className="hidden md:flex items-center gap-1.5" ref={observerRef}>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 p-1.5 outline-hidden"
            aria-label="Select country"
          >
            <ReactCountryFlag
              svg
              countryCode={selectedLocale.country}
              className="rounded-xs"
              style={{ width: "24px", height: "16px" }}
            />
            {countryNameDisplay === "full" ? (
              <>
                <span className="hidden xl:inline">{selectedLocale.label}</span>
                <span className="xl:hidden">{selectedLocale.country}</span>
              </>
            ) : (
              <span>{selectedLocale.country}</span>
            )}
            <Icon name="caret-down" className="h-3 w-3" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content align="center" sideOffset={8} className="z-50">
            <ScrollArea
              size="sm"
              style={{ maxHeight: 360, width: 300 }}
              rootClassName="border border-gray-300 rounded-lg bg-white py-2 shadow-lg"
            >
              {groupedCountries.map((group) => {
                const isActiveCountry =
                  group.country === selectedLocale.country;
                if (group.locales.length === 1) {
                  const { path, locale } = group.locales[0];
                  return (
                    <Popover.Close
                      aria-label={`Select ${locale.label}`}
                      key={path}
                      type="button"
                      onClick={() =>
                        handleLocaleChange({
                          redirectTo: getRedirectUrl(locale),
                          buyerIdentity: { countryCode: locale.country },
                        })
                      }
                      className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left transition hover:bg-neutral-200"
                    >
                      <ReactCountryFlag
                        svg
                        countryCode={locale.country}
                        className="rounded-xs shrink-0"
                        style={{ width: "24px", height: "16px" }}
                      />
                      <span
                        className={cn(
                          "truncate",
                          isActiveCountry && "font-medium",
                        )}
                      >
                        {locale.label}
                      </span>
                      {isActiveCountry ? (
                        <Icon
                          name="check"
                          className="ml-auto size-4 shrink-0"
                        />
                      ) : null}
                    </Popover.Close>
                  );
                }

                return (
                  <div key={group.country} className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <ReactCountryFlag
                        svg
                        countryCode={group.country}
                        className="rounded-xs shrink-0"
                        style={{ width: "24px", height: "16px" }}
                      />
                      <span
                        className={cn(
                          "truncate",
                          isActiveCountry && "font-medium",
                        )}
                      >
                        {group.label}
                      </span>
                      {isActiveCountry ? (
                        <Icon
                          name="check"
                          className="ml-auto size-4 shrink-0"
                        />
                      ) : null}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 pl-8">
                      {group.locales.map(({ path, locale }, i) => {
                        const isSelected =
                          locale.language === selectedLocale.language &&
                          locale.country === selectedLocale.country;
                        return (
                          <Fragment key={path}>
                            {i > 0 ? (
                              <span
                                aria-hidden
                                className="h-3.5 w-px bg-neutral-300"
                              />
                            ) : null}
                            <Popover.Close
                              aria-label={`Select ${locale.label} in ${locale.language}`}
                              type="button"
                              onClick={() =>
                                handleLocaleChange({
                                  redirectTo: getRedirectUrl(locale),
                                  buyerIdentity: {
                                    countryCode: locale.country,
                                  },
                                })
                              }
                              className={cn(
                                "cursor-pointer underline-offset-4 transition",
                                isSelected
                                  ? "font-medium text-neutral-900 underline"
                                  : "text-neutral-500 hover:text-neutral-900 hover:underline",
                              )}
                            >
                              {LANGUAGE_LABELS[locale.language] ??
                                locale.language}
                            </Popover.Close>
                          </Fragment>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <div className="w-1 h-4 border-l border-gray-300" />
    </div>
  );
}
