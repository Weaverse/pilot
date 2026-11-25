import { expect, test } from "@playwright/test";
import { isAnalyticsAllowed } from "../../app/components/root/custom-analytics";

function privacy(
  consentStatus: "loading" | "loaded",
  allowed: boolean,
  analytics?: string,
) {
  return {
    consentStatus,
    currentVisitorConsent: () => (analytics ? { analytics } : {}),
    analyticsProcessingAllowed: () => allowed,
  };
}

test("should_block_gtm_until_customer_privacy_loads", () => {
  expect(isAnalyticsAllowed(undefined)).toBe(false);
  expect(isAnalyticsAllowed(privacy("loading", true))).toBe(false);
});

test("should_follow_analytics_processing_permission", () => {
  expect(isAnalyticsAllowed(privacy("loaded", true))).toBe(true);
  expect(isAnalyticsAllowed(privacy("loaded", false))).toBe(false);
  expect(isAnalyticsAllowed(privacy("loaded", true, "no"))).toBe(false);
});
