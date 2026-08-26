import { useThemeSettings, useTranslation } from "@weaverse/hydrogen";
import { legacyThemeText } from "~/utils/legacy-theme-text";

/**
 * Reads theme copy, preferring a merchant's persisted legacy setting over the
 * theme's bundled default.
 *
 * The precedence rule lives in {@link legacyThemeText}; this hook only binds it
 * to Weaverse's stores so the decision stays testable without a React tree.
 */
export function useLegacyThemeText() {
  const { t, merchantOverrides } = useTranslation();
  const settings = useThemeSettings<Record<string, unknown>>();

  return (key: string): string =>
    legacyThemeText(key, settings, merchantOverrides) ?? t(key);
}
