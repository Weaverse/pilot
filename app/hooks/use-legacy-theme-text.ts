import { useThemeSettings, useTranslation } from "@weaverse/hydrogen";
import { legacyThemeText } from "~/utils/legacy-theme-text";

/**
 * Reads theme copy, preferring a merchant's persisted legacy setting over the
 * theme's bundled default — but never over an edit they are making now.
 *
 * The precedence rule lives in {@link legacyThemeText}; this hook only binds it
 * to Weaverse's stores so the decision stays testable without a React tree.
 * `translationStore` holds live design-mode edits and is null in production,
 * where the chain collapses to the persisted behaviour.
 */
export function useLegacyThemeText() {
  const { t, merchantOverrides, translationStore } = useTranslation();
  const settings = useThemeSettings<Record<string, unknown>>();

  return (key: string): string =>
    legacyThemeText(
      key,
      settings,
      merchantOverrides,
      translationStore?.getSnapshot(),
    ) ?? t(key);
}
