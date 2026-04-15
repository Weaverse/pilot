import { CaretDownIcon, CheckCircleIcon } from "@phosphor-icons/react";
import * as Popover from "@radix-ui/react-popover";
import ReactCountryFlag from "react-country-flag";
import { ScrollArea } from "~/components/scroll-area";
import { useCountrySelector } from "./use-country-selector";

export function FooterCountrySelector() {
  const {
    selectedLocale,
    countries,
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
              style={{ width: "24px", height: "14px" }}
            />
            <span>{selectedLocale.label}</span>
            <CaretDownIcon className="ml-auto h-4 w-4" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content>
            <ScrollArea
              size="sm"
              style={{ maxHeight: 160, width: 320 }}
              rootClassName="my-2 rounded-lg bg-neutral-800 py-2"
            >
              {countries &&
                Object.keys(countries).map((countryPath) => {
                  const countryLocale = countries[countryPath];
                  const isSelected =
                    countryLocale.language === selectedLocale.language &&
                    countryLocale.country === selectedLocale.country;

                  return (
                    <Popover.Close
                      aria-label={`Select ${countryLocale.label} country`}
                      key={countryPath}
                      type="button"
                      onClick={() =>
                        handleLocaleChange({
                          redirectTo: getRedirectUrl(countryLocale),
                          buyerIdentity: {
                            countryCode: countryLocale.country,
                          },
                        })
                      }
                      className="flex w-full cursor-pointer items-center gap-2 bg-neutral-800 p-2 px-4 py-2 text-left text-white transition hover:bg-neutral-600"
                    >
                      <ReactCountryFlag
                        svg
                        countryCode={countryLocale.country}
                        className="rounded-xs"
                        style={{ width: "24px", height: "14px" }}
                      />
                      <span>{countryLocale.label}</span>
                      {isSelected ? (
                        <span className="ml-auto">
                          <CheckCircleIcon className="h-5 w-5" />
                        </span>
                      ) : null}
                    </Popover.Close>
                  );
                })}
            </ScrollArea>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
