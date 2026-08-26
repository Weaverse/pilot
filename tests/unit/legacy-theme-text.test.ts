import { expect, test } from "@playwright/test";
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

test("an empty legacy setting does not blank the string", () => {
  // A merchant who cleared the old field must not get an empty footer.
  expect(legacyThemeText("footer.copyright", { copyright: "" }, null)).toBe(
    null,
  );
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
