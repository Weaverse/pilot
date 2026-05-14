import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react";
import * as Popover from "@radix-ui/react-popover";
import { Fragment } from "react";
import ReactCountryFlag from "react-country-flag";
import { ScrollArea } from "~/components/scroll-area";
import { cn } from "~/utils/cn";
import { LANGUAGE_LABELS } from "~/utils/const";
import { useCountrySelector } from "./use-country-selector";

export function FooterCountrySelector() {
  const {
    selectedLocale,
    groupedCountries,
    observerRef,
    handleLocaleChange,
    getRedirectUrl,
  } = useCountrySelector();

  return (
    <div ref={observerRef} className="grid w-80 gap-4">
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2 overflow-clip rounded-md border border-line-subtle px-4 py-3 text-left outline-hidden"
            aria-label="Select country"
          >
            <ReactCountryFlag
              svg
              countryCode={selectedLocale.country}
              className="rounded-xs"
              style={{ width: "22px", height: "14px" }}
            />
            <span>{selectedLocale.label}</span>
            <CaretDownIcon className="ml-auto h-4 w-4" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content>
            <ScrollArea
              size="sm"
              style={{ maxHeight: 280, width: 320 }}
              rootClassName="my-2 rounded-lg bg-neutral-800 py-2"
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
                      className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-white transition hover:bg-neutral-600"
                    >
                      <ReactCountryFlag
                        svg
                        countryCode={locale.country}
                        className="rounded-xs shrink-0"
                        style={{ width: "22px", height: "14px" }}
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
                        <CheckIcon className="ml-auto size-4 shrink-0" />
                      ) : null}
                    </Popover.Close>
                  );
                }

                return (
                  <div key={group.country} className="px-4 py-2 text-white">
                    <div className="flex items-center gap-2">
                      <ReactCountryFlag
                        svg
                        countryCode={group.country}
                        className="rounded-xs shrink-0"
                        style={{ width: "22px", height: "14px" }}
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
                        <CheckIcon className="ml-auto size-4 shrink-0" />
                      ) : null}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 pl-7">
                      {group.locales.map(({ path, locale }, i) => {
                        const isSelected =
                          locale.language === selectedLocale.language &&
                          locale.country === selectedLocale.country;
                        return (
                          <Fragment key={path}>
                            {i > 0 ? (
                              <span
                                aria-hidden
                                className="h-3.5 w-px bg-neutral-600"
                              />
                            ) : null}
                            <Popover.Close
                              aria-label={`Select ${locale.label} in ${locale.language}`}
                              type="button"
                              onClick={() =>
                                handleLocaleChange({
                                  redirectTo: getRedirectUrl(locale),
                                  buyerIdentity: { countryCode: locale.country },
                                })
                              }
                              className={cn(
                                "cursor-pointer underline-offset-4 transition",
                                isSelected
                                  ? "font-medium text-white underline"
                                  : "text-neutral-400 hover:text-white hover:underline",
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
    </div>
  );
}
