import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { hasVisibleAnnouncement } from "../../app/components/layout/scrolling-announcement";
import staticContent from "../../app/i18n/en.json" with { type: "json" };
import {
  LEGACY_SETTING_FOR_KEY,
  legacyThemeText,
} from "../../app/utils/legacy-theme-text";

test("a merchant's pre-migration copy survives the upgrade", () => {
  // The bundled default is `contact@my-store.com`. An existing storefront has
  // the merchant's real address under the old setting name, and publishing demo
  // contact details on a live store is data loss.
  expect(
    legacyThemeText(
      "footer.storeEmail",
      { storeEmail: "hello@westside.example" },
      null,
    ),
  ).toBe("hello@westside.example");
});

test("a published translation wins over the legacy setting", () => {
  // Once the merchant edits the string in the Translation Manager that is their
  // current intent, so the stale setting must stop being consulted.
  expect(
    legacyThemeText(
      "footer.storeEmail",
      { storeEmail: "old@westside.example" },
      { footer: { storeEmail: "neu@westside.example" } },
    ),
  ).toBe(null);
});

test("a fresh install falls through to the theme's own copy", () => {
  // `null` means "use t(key)", i.e. the bundled translation for the market.
  expect(legacyThemeText("footer.storeEmail", {}, null)).toBe(null);
  expect(legacyThemeText("footer.storeEmail", undefined, undefined)).toBe(null);
});

test("a cleared legacy setting stays cleared", () => {
  // A merchant who emptied their store address or announcement wanted it gone.
  // Reading that as "absent" republishes bundled demo copy on a live
  // storefront, so a present-but-empty property is honoured as an empty string.
  expect(legacyThemeText("footer.copyright", { copyright: "" }, null)).toBe("");
  expect(legacyThemeText("footer.storeEmail", { storeEmail: "" }, null)).toBe(
    "",
  );
  expect(
    legacyThemeText("announcement.topbarText", { topbarText: "" }, null),
  ).toBe("");
});

test("a missing legacy property is not a cleared one", () => {
  // Never set (fresh install, or a key this storefront never had) must fall
  // through to the theme's bundled copy, which is the whole point of a default.
  expect(legacyThemeText("footer.copyright", {}, null)).toBe(null);
  expect(legacyThemeText("footer.copyright", { unrelated: "x" }, null)).toBe(
    null,
  );
  // A non-string value is not usable copy either.
  expect(legacyThemeText("footer.copyright", { copyright: 0 }, null)).toBe(
    null,
  );
  expect(legacyThemeText("footer.copyright", { copyright: null }, null)).toBe(
    null,
  );
});

test("an inherited property is not the merchant's own setting", () => {
  // `in` must not be satisfied by the prototype chain: `toString` lives on
  // `Object.prototype`, and no merchant ever set it.
  const settings = Object.create({ copyright: "inherited" }) as Record<
    string,
    unknown
  >;

  expect(legacyThemeText("footer.copyright", settings, null)).toBe(null);
});

test("a published translation still wins over a cleared legacy setting", () => {
  // Precedence is unchanged by the presence fix: the new system is current
  // intent, so it outranks anything left in the old one.
  expect(
    legacyThemeText(
      "footer.copyright",
      { copyright: "" },
      { footer: { copyright: "© 2026 Merchant" } },
    ),
  ).toBe(null);
});

test("every mapped key exists in the theme's source content", () => {
  // A typo in the map would silently disable the fallback for that string.
  const source = staticContent as Record<string, Record<string, unknown>>;
  for (const key of Object.keys(LEGACY_SETTING_FOR_KEY)) {
    const [group, leaf] = key.split(".");
    expect({ key, present: typeof source[group]?.[leaf] === "string" }).toEqual(
      {
        key,
        present: true,
      },
    );
  }
});

test("a cleared announcement reserves no height", () => {
  // The height is `topbarText ? topbarHeight : 0`, so a merchant who cleared
  // the legacy announcement must yield a falsy string, not bundled demo copy.
  expect(
    legacyThemeText("announcement.topbarText", { topbarText: "" }, null),
  ).toBe("");
});

/**
 * Both sides now answer "is there an announcement?" with the same two calls:
 * {@link legacyThemeText} for the copy, {@link hasVisibleAnnouncement} for
 * whether it paints. `RootLayout` reserves `--initial-topbar-height` from that
 * answer and `ScrollingAnnouncement` renders from it.
 */
function announcementFor(settings: Record<string, unknown>): string {
  return (
    legacyThemeText("announcement.topbarText", settings, null) ??
    (staticContent.announcement.topbarText as string)
  );
}

test("blank announcement markup reserves no height", () => {
  // The concrete regression: rich text that is a non-empty string but paints
  // nothing must not reserve a 36px strip above the header.
  expect(hasVisibleAnnouncement("<p></p>")).toBe(false);
  expect(hasVisibleAnnouncement("<p>  </p>")).toBe(false);
  expect(hasVisibleAnnouncement("")).toBe(false);
  expect(hasVisibleAnnouncement(null)).toBe(false);
  expect(hasVisibleAnnouncement(undefined)).toBe(false);
  expect(hasVisibleAnnouncement("<p>Winter sale</p>")).toBe(true);
});

test("a cleared legacy announcement beats the bundled default", () => {
  // Without the presence fix this fell through to the theme's demo copy and
  // republished "Free shipping on orders over $50" on a live storefront.
  expect(announcementFor({ topbarText: "" })).toBe("");
  expect(hasVisibleAnnouncement(announcementFor({ topbarText: "" }))).toBe(
    false,
  );
  expect(announcementFor({})).toBe(staticContent.announcement.topbarText);
});

test("the root reserves height through the shared announcement check", async () => {
  // A wiring guard, deliberately structural: `useThemeSettings` reads a context
  // the SDK does not export, so rendering `RootLayout` would exercise a fake
  // provider instead of the real path. The behavior of the decision itself is
  // covered above; what this pins is that the root actually calls it, because
  // re-inlining `topbarText ? topbarHeight : 0` silently reserves a 36px strip
  // for blank markup that `ScrollingAnnouncement` refuses to render.
  // Formatting is the formatter's business, so compare on collapsed whitespace.
  const root = (
    await readFile(new URL("../../app/root.tsx", import.meta.url), "utf8")
  ).replace(/\s+/g, " ");

  expect({
    usesSharedCheck: root.includes(
      "hasVisibleAnnouncement(topbarText) ? topbarHeight : 0",
    ),
    // The reader must be the legacy-aware hook, not just a binding named
    // `themeText`: what matters is where the copy comes from.
    usesLegacyAwareReader:
      root.includes("const themeText = useLegacyThemeText();") &&
      root.includes('themeText("announcement.topbarText")'),
    // A raw `t()` would ignore a merchant's pre-migration announcement.
    // Word-bounded: `themeText("announcement.topbarText")` ends in that same
    // substring and is the call we want.
    readsRawTranslation: /\bt\("announcement\.topbarText"\)/.test(root),
  }).toEqual({
    usesSharedCheck: true,
    usesLegacyAwareReader: true,
    readsRawTranslation: false,
  });
});
