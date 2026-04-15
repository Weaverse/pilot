import { CaretDownIcon, CheckCircleIcon } from "@phosphor-icons/react";
import * as Popover from "@radix-ui/react-popover";
import { useThemeSettings } from "@weaverse/hydrogen";
import ReactCountryFlag from "react-country-flag";
import { ScrollArea } from "~/components/scroll-area";
import type { ThemeSettings } from "~/types/weaverse";
import { useCountrySelector } from "./use-country-selector";

export function HeaderCountrySelector() {
  const {
    selectedLocale,
    countries,
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
            className="flex cursor-pointer items-center gap-1 p-1.5 outline-hidden"
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
            <CaretDownIcon className="h-3 w-3" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content align="center" sideOffset={8} className="z-50">
            <ScrollArea
              size="sm"
              style={{ maxHeight: 240, width: 256 }}
              rootClassName="border border-gray-300 rounded-lg bg-white py-2 shadow-lg"
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
                      className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-body transition hover:bg-neutral-100"
                    >
                      <ReactCountryFlag
                        svg
                        countryCode={countryLocale.country}
                        className="rounded-xs"
                        style={{ width: "20px", height: "12px" }}
                      />
                      <span>{countryLocale.label}</span>
                      {isSelected ? (
                        <span className="ml-auto">
                          <CheckCircleIcon className="size-5" />
                        </span>
                      ) : null}
                    </Popover.Close>
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
