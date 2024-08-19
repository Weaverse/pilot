import { useMatches } from "@remix-run/react";
import type { ShopifyPageViewPayload } from "@shopify/hydrogen";
import { useMemo } from "react";
import { DEFAULT_LOCALE } from "~/lib/utils";

export function usePageAnalytics({
  hasUserConsent,
}: {
  hasUserConsent: boolean;
}) {
  let matches = useMatches();

  return useMemo(() => {
    let data: Record<string, unknown> = {};
    for (let match of matches) {
      let eventData = match?.data as Record<string, unknown>;
      if (eventData) {
        eventData.analytics && Object.assign(data, eventData.analytics);
        let selectedLocale =
          (eventData.selectedLocale as typeof DEFAULT_LOCALE) || DEFAULT_LOCALE;
        Object.assign(data, {
          currency: selectedLocale.currency,
          acceptedLanguage: selectedLocale.language,
        });
      }
    }

    return {
      ...data,
      hasUserConsent,
    } as unknown as ShopifyPageViewPayload;
  }, [matches, hasUserConsent]);
}
