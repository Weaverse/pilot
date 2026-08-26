import { expect, test } from "@playwright/test";
import { TranslationProvider, TranslationStore } from "@weaverse/hydrogen";
import { createElement, type ReactElement } from "react";
import { loadComponent, renderInApp } from "../support/render-app";

/**
 * Live design-mode edits must be visible in Studio before they are published.
 *
 * The SDK resolves a key as `designOverrides ?? merchantOverrides ??
 * staticContent`, so a live edit outranks everything persisted. Pilot's legacy
 * fallback reads a pre-migration theme setting for migrated keys, and if it
 * answers before consulting `t()` the merchant edits a string in the
 * Translation Manager and the storefront preview does not change — the theme
 * silently ignores the feature it was migrated onto.
 *
 * These render the shipped components rather than re-implementing the
 * precedence rule: the defect was that a component never reached the rule.
 */

/** A storefront whose merchant edited both strings before the migration. */
const EDITED_LEGACY_SETTINGS = {
  topbarText: "<p>PERSISTED LEGACY ANNOUNCEMENT</p>",
  pcardQuickShopButtonText: "PERSISTED LEGACY LABEL",
  // The quick-shop trigger only renders its label in `text` mode.
  pcardQuickShopButtonType: "text",
  pcardEnableQuickShop: true,
};

const STATIC_CONTENT = {
  announcement: { topbarText: "<p>BUNDLED ANNOUNCEMENT</p>" },
  product: { quickShop: "BUNDLED LABEL" },
};

const ROOT_DATA = {
  weaverseTheme: {
    theme: EDITED_LEGACY_SETTINGS,
    staticContent: STATIC_CONTENT,
    merchantOverrides: null,
  },
};

/**
 * The shipped provider carrying `overrides` as unpublished design-mode edits.
 *
 * `children` goes in props because `TranslationProviderProps` requires it.
 */
function withLiveEdits(
  overrides: Record<string, string>,
  children: ReactElement,
  staticContent: Record<string, unknown> = STATIC_CONTENT,
) {
  const store = new TranslationStore();
  store.setOverrides(overrides);

  return createElement(TranslationProvider, {
    staticContent,
    translationStore: store,
    children,
  });
}

test("a live announcement edit is previewed over an edited legacy setting", async () => {
  const { ScrollingAnnouncement } = await loadComponent<{
    ScrollingAnnouncement: () => ReactElement;
  }>("components/layout/scrolling-announcement.tsx");

  const html = await renderInApp(ROOT_DATA, () =>
    withLiveEdits(
      { "announcement.topbarText": "<p>LIVE STUDIO EDIT</p>" },
      createElement(ScrollingAnnouncement),
    ),
  );

  expect(html).toContain("LIVE STUDIO EDIT");
  expect(html).not.toContain("PERSISTED LEGACY ANNOUNCEMENT");
});

test("a live quick-shop edit is previewed over an edited legacy setting", async () => {
  const { QuickShopTrigger } = await loadComponent<{
    QuickShopTrigger: (props: Record<string, unknown>) => ReactElement;
  }>("components/product-card/quick-shop.tsx");

  const html = await renderInApp(ROOT_DATA, () =>
    withLiveEdits(
      { "product.quickShop": "LIVE STUDIO EDIT" },
      createElement(QuickShopTrigger, {
        productHandle: "hoodie",
        buttonType: "text",
      }),
    ),
  );

  expect(html).toContain("LIVE STUDIO EDIT");
  expect(html).not.toContain("PERSISTED LEGACY LABEL");
});

test("without a live edit the merchant's legacy copy still renders", async () => {
  const { QuickShopTrigger } = await loadComponent<{
    QuickShopTrigger: (props: Record<string, unknown>) => ReactElement;
  }>("components/product-card/quick-shop.tsx");

  const html = await renderInApp(ROOT_DATA, () =>
    withLiveEdits(
      {},
      createElement(QuickShopTrigger, {
        productHandle: "hoodie",
        buttonType: "text",
      }),
    ),
  );

  expect(html).toContain("PERSISTED LEGACY LABEL");
  expect(html).not.toContain("BUNDLED LABEL");
});

test("clearing a string in Studio previews as cleared", async () => {
  // Deleting the text is an edit like any other: the merchant is looking at
  // the preview to decide whether the bar should go. Treating the empty value
  // as "no edit" republishes their pre-migration announcement underneath the
  // cursor, so the only way to see the result is to publish and reload.
  const { ScrollingAnnouncement } = await loadComponent<{
    ScrollingAnnouncement: () => ReactElement;
  }>("components/layout/scrolling-announcement.tsx");

  const html = await renderInApp(ROOT_DATA, () =>
    withLiveEdits(
      { "announcement.topbarText": "" },
      createElement(ScrollingAnnouncement),
    ),
  );

  expect(html).not.toContain("PERSISTED LEGACY ANNOUNCEMENT");
});

test("a badge renders the market's copy, never a hardcoded literal", async () => {
  // Badges are the surface where a hardcoded string is least visible: the
  // English word often looks plausible in a localized page, so a regression
  // here ships quietly. Rendering the real component is the only way to catch
  // a component that stopped consulting the reader at all.
  const { NewBadge } = await loadComponent<{
    NewBadge: (props: Record<string, unknown>) => ReactElement;
  }>("components/product/badges.tsx");

  const html = await renderInApp(
    {
      weaverseTheme: {
        theme: {},
        staticContent: { badge: { new: "NEU" } },
        merchantOverrides: null,
      },
    },
    () =>
      withLiveEdits(
        {},
        createElement(NewBadge, {
          publishedAt: new Date().toISOString(),
          badgeStyle: "default",
          newBadgeColor: "#000",
          newBadgeDaysOld: 30,
        }),
        { badge: { new: "NEU" } },
      ),
  );

  expect(html).toContain("NEU");
  expect(html).not.toContain(">New<");
});
