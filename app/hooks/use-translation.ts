import { useRouteLoaderData } from "react-router";
import defaultTranslations from "~/i18n/en.json";
import type { RootLoader } from "~/root";

export type Translations = typeof defaultTranslations;

/**
 * Hook to access translations loaded from the multilingual manager API.
 * Falls back to default English translations if not available.
 *
 * @example
 * const { t } = useTranslation();
 * const text = t('cart.actions.addNote'); // "Add a note"
 * const greeting = t('product.pictureOf', { name: 'T-Shirt' }); // "Picture of T-Shirt"
 */
export function useTranslation() {
  const data = useRouteLoaderData<RootLoader>("root");
  // translations can be loaded from API in root loader, or fallback to default
  const translations = ((data as Record<string, unknown>)?.translations as Translations) || defaultTranslations;

  /**
   * Get a translated string by key path.
   * Supports interpolation with {{placeholder}} syntax.
   *
   * @param key - Dot-separated path to the translation (e.g., 'cart.actions.addNote')
   * @param params - Optional parameters for interpolation
   * @returns The translated string, or the key if not found
   */
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: unknown = translations;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // Key not found, return the key itself as fallback
        console.warn(`Translation missing: ${key}`);
        return key;
      }
    }

    if (typeof value !== "string") {
      console.warn(`Translation path does not resolve to string: ${key}`);
      return key;
    }

    // Replace template params like {{name}}
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) =>
        String(params[paramKey] ?? `{{${paramKey}}}`),
      );
    }

    return value;
  };

  return { t, translations };
}
