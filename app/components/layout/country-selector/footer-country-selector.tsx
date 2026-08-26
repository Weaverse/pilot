import * as Popover from "@radix-ui/react-popover";
import { Fragment } from "react";
import ReactCountryFlag from "react-country-flag";
import { Icon } from "~/components/icon";
import { ScrollArea } from "~/components/scroll-area";
import { cn } from "~/utils/cn";
import { MarketForm } from "./market-form";
import { useCountrySelector } from "./use-country-selector";

export function FooterCountrySelector() {
  const {
    selectedLocale,
    groupedCountries,
    cartRoute,
    getRedirectUrl,
    buyerIdentityInput,
  } = useCountrySelector();

  return (
    <div className="grid w-80 gap-4">
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
              style={{ width: "24px", height: "16px" }}
            />
            <span>{selectedLocale.label}</span>
            <Icon name="caret-down" className="ml-auto h-4 w-4" />
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
                  const locale = group.locales[0];
                  return (
                    <MarketForm
                      key={locale.pathPrefix}
                      locale={locale}
                      cartRoute={cartRoute}
                      redirectTo={getRedirectUrl(locale)}
                      buyerIdentityInput={buyerIdentityInput(locale)}
                      label={`Select ${locale.label}`}
                      className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-white transition hover:bg-neutral-600"
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
                    </MarketForm>
                  );
                }

                return (
                  <div key={group.country} className="px-4 py-2 text-white">
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
                      {group.locales.map((locale, i) => {
                        const isSelected =
                          locale.pathPrefix === selectedLocale.pathPrefix;
                        return (
                          <Fragment key={locale.pathPrefix}>
                            {i > 0 ? (
                              <span
                                aria-hidden
                                className="h-3.5 w-px bg-neutral-600"
                              />
                            ) : null}
                            <MarketForm
                              locale={locale}
                              cartRoute={cartRoute}
                              redirectTo={getRedirectUrl(locale)}
                              buyerIdentityInput={buyerIdentityInput(locale)}
                              label={`Select ${locale.label} in ${locale.languageLabel}`}
                              className={cn(
                                "cursor-pointer underline-offset-4 transition",
                                isSelected
                                  ? "font-medium text-white underline"
                                  : "text-neutral-400 hover:text-white hover:underline",
                              )}
                            >
                              {locale.languageLabel}
                            </MarketForm>
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
