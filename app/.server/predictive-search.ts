import { createPredictiveSearchServerHandlers } from "@shopify/hydrogen";
import {
  PREDICTIVE_SEARCH_FRAGMENTS,
  PREDICTIVE_SEARCH_SETTINGS,
} from "~/components/layout/predictive-search/predictive-search-query";

/**
 * `GET /api/predictive-search?q=…`. The market comes from the page's
 * `Referer` (see `resolveRequestLocale`), like every unprefixed handler.
 */
export const predictiveSearchHandlers = createPredictiveSearchServerHandlers({
  fragments: PREDICTIVE_SEARCH_FRAGMENTS,
  ...PREDICTIVE_SEARCH_SETTINGS,
  types: [...PREDICTIVE_SEARCH_SETTINGS.types],
});
