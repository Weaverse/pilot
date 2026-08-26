import { expect, test } from "@playwright/test";
import { resolveThemeContent } from "../../app/.server/translations";
import { parseAsCurrency } from "../../app/routes/collections/utils";
import {
  bundleLocaleFor,
  providerContextForRequest,
  providerLanguageFor,
  resolveLocale,
  SUPPORTED_LOCALES,
} from "../../app/utils/locale";

/**
 * Chinese languages Shopify actually resolves, taken from the installed
 * `LanguageCode` enum. Bare `ZH` is a member but is not a market language:
 * a read-only Storefront probe of this store returned `EN` for `ZH`/`CN`,
 * `ZH`/`HK` and `ZH`/`TW`, while `ZH_CN` returned `ZH_CN`.
 */
const RESOLVING_CHINESE = new Set(["ZH_CN", "ZH_TW"]);

test("Chinese markets request a language Shopify resolves", () => {
  // Sending bare `ZH` silently serves an English catalogue under a Chinese
  // URL with Chinese theme chrome — a mixed-language storefront.
  const chinese = SUPPORTED_LOCALES.filter((locale) =>
    locale.hreflang.startsWith("zh-"),
  );

  expect(chinese.length).toBeGreaterThan(0);
  for (const locale of chinese) {
    expect({
      prefix: locale.pathPrefix,
      resolves: RESOLVING_CHINESE.has(providerLanguageFor(locale)),
    }).toEqual({ prefix: locale.pathPrefix, resolves: true });
  }
});

test("the provider language never dictates the public URL", () => {
  // `/zh-cn` must stay `/zh-cn` even though the market asks Shopify for
  // `ZH_CN`; deriving the prefix from the provider enum would publish
  // `/zh_cn-cn` and break every indexed Chinese URL.
  for (const [prefix, hreflang] of [
    ["/zh-cn", "zh-CN"],
    ["/zh-hk", "zh-HK"],
    ["/zh-tw", "zh-TW"],
  ]) {
    const locale = resolveLocale(`${prefix}/products/hoodie`);

    expect({
      prefix: locale.pathPrefix,
      hreflang: locale.hreflang,
      country: locale.country,
    }).toEqual({
      prefix,
      hreflang,
      country: hreflang.split("-")[1],
    });
  }
});

test("every market's URL prefix is its own BCP-47 identity", () => {
  // The public prefix and the `hreflang` are one decision; the provider enum
  // is a different one. Tying the prefix to the provider enum is what blocked
  // `ZH_CN` from being sent at all.
  for (const locale of SUPPORTED_LOCALES) {
    if (locale.pathPrefix === "") {
      continue;
    }
    expect({
      prefix: locale.pathPrefix,
      fromHreflang: `/${locale.hreflang.toLowerCase()}`,
    }).toEqual({
      prefix: locale.pathPrefix,
      fromHreflang: locale.pathPrefix,
    });
  }
});

test("theme copy is selected by bundle locale, not the provider enum", () => {
  // `ZH_CN` is not a bundle name. Keying the theme's own translations off the
  // provider enum drops every Chinese market back to English chrome.
  for (const [prefix, cartTitle] of [
    ["/zh-cn", "购物车"],
    ["/zh-hk", "購物車"],
    ["/zh-tw", "購物車"],
  ] as const) {
    const locale = resolveLocale(`${prefix}/products/hoodie`);
    const translations = resolveThemeContent(locale, undefined) as
      | Record<string, Record<string, string>>
      | undefined;

    expect({
      prefix,
      translated: translations?.cart?.title,
    }).toEqual({ prefix, translated: cartTitle });
  }
});

test("money formats with a real BCP-47 tag", () => {
  // `Intl` rejects `ZH_CN-CN`. Building the tag from the provider enum throws
  // on a product grid the moment the enum stops being a bare language code.
  for (const prefix of ["/zh-cn", "/zh-tw", "/de-de", ""]) {
    const locale = resolveLocale(`${prefix}/collections/all`);

    expect(() => parseAsCurrency(19.99, locale)).not.toThrow();
    expect(parseAsCurrency(19.99, locale)).not.toContain("NaN");
  }
});

test("the request context sends the provider language, not the URL one", () => {
  // `createHydrogenContext` receives `i18n`, and Hydrogen puts it on every
  // `@inContext` query. This is the exact composition `app/.server/context.ts`
  // performs, so a Chinese route asks Shopify for a code it resolves while the
  // market keeps its own BCP-47 identity.
  for (const [prefix, expected] of [
    ["/zh-cn", "ZH_CN"],
    ["/zh-hk", "ZH_TW"],
    ["/zh-tw", "ZH_TW"],
    // Every other market already sends a valid enum, so nothing changes.
    ["/de-de", "DE"],
    ["/ar-ae", "AR"],
    ["", "EN"],
  ] as const) {
    const locale = resolveLocale(`${prefix}/products/hoodie`);
    const i18n = providerContextForRequest(
      new Request(`https://shop.test${prefix}/products/hoodie`),
    );

    expect({
      prefix,
      sent: i18n.language,
      // The public identity survives the swap untouched.
      hreflang: i18n.hreflang,
      pathPrefix: i18n.pathPrefix,
      country: i18n.country,
    }).toEqual({
      prefix,
      sent: expected,
      hreflang: locale.hreflang,
      pathPrefix: prefix,
      country: locale.country,
    });
  }
});

test("Hong Kong and Taiwan ask for traditional Chinese", () => {
  // Script matters: `ZH_CN` is Simplified and `ZH_TW` Traditional in the
  // installed `LanguageCode` enum. Serving Simplified copy to a Traditional
  // market is the same class of defect as serving English.
  const simplified = resolveLocale("/zh-cn/products/hoodie");
  const hongKong = resolveLocale("/zh-hk/products/hoodie");
  const taiwan = resolveLocale("/zh-tw/products/hoodie");

  expect(providerLanguageFor(simplified)).toBe("ZH_CN");
  expect(providerLanguageFor(hongKong)).toBe("ZH_TW");
  expect(providerLanguageFor(taiwan)).toBe("ZH_TW");
});

test("the theme bundle is chosen by the same locale the provider context carries", () => {
  // `resolveThemeContent` runs on the object `createHydrogenContext` receives.
  // Keying it off that object's `language` — the provider enum — is exactly how
  // a Chinese market loses its Chinese chrome, so compose them as production
  // does rather than asserting each half in isolation.
  for (const [prefix, cartTitle] of [
    ["/zh-cn", "购物车"],
    ["/zh-hk", "購物車"],
    ["/zh-tw", "購物車"],
    ["/de-de", "Warenkorb"],
  ] as const) {
    const context = providerContextForRequest(
      new Request(`https://shop.test${prefix}/cart`),
    );
    const translations = resolveThemeContent(context, undefined) as
      | Record<string, Record<string, string>>
      | undefined;

    expect({ prefix, title: translations?.cart?.title }).toEqual({
      prefix,
      title: cartTitle,
    });
  }
});

test("the request boundary is what decides the provider context", () => {
  // `app/.server/context.ts` hands `providerContextForRequest(request)` to
  // `createHydrogenContext`, so this is the whole decision a real request makes
  // — URL in, `@inContext` variables out. Bypassing it and passing the raw
  // locale is the regression that ships English catalogues on Chinese URLs.
  const context = providerContextForRequest(
    new Request("https://shop.test/zh-hk/collections/all?sort=price"),
  );

  expect({
    sent: context.language,
    country: context.country,
    currency: context.currency,
    hreflang: context.hreflang,
    pathPrefix: context.pathPrefix,
  }).toEqual({
    sent: "ZH_TW",
    country: "HK",
    currency: "HKD",
    hreflang: "zh-HK",
    pathPrefix: "/zh-hk",
  });
});

test("Traditional-script markets do not receive Simplified copy", () => {
  // Hong Kong and Taiwan write Traditional Chinese; mainland China writes
  // Simplified. Deriving the bundle from the BCP-47 primary subtag collapses
  // all three onto one file, so `/zh-tw` renders Simplified chrome — the same
  // class of defect as sending the wrong provider language, one layer up.
  const simplifiedOnly = /[购开车筛货单发这个东确认]/;
  const traditionalOnly = /[購開車篩貨單發這個東確認]/;

  for (const prefix of ["/zh-hk", "/zh-tw"]) {
    const locale = resolveLocale(`${prefix}/cart`);
    const copy = resolveThemeContent(locale, undefined) as
      | Record<string, Record<string, string>>
      | undefined;
    const sample = [
      copy?.cart?.title,
      copy?.product?.addToCart,
      copy?.collection?.filter,
    ].join(" ");

    expect({
      prefix,
      simplified: simplifiedOnly.test(sample),
      traditional: traditionalOnly.test(sample),
    }).toEqual({ prefix, simplified: false, traditional: true });
  }
});

test("Simplified stays Simplified for mainland China", () => {
  const locale = resolveLocale("/zh-cn/cart");
  const copy = resolveThemeContent(locale, undefined) as
    | Record<string, Record<string, string>>
    | undefined;

  expect(copy?.cart?.title).toBe("购物车");
});

test("all four locale identities can differ independently", () => {
  // URL prefix, BCP-47 identity, theme bundle and provider language are four
  // separate decisions. `/zh-tw` is the market where all four diverge.
  const taiwan = resolveLocale("/zh-tw/cart");

  expect({
    url: taiwan.pathPrefix,
    bcp47: taiwan.hreflang,
    bundle: bundleLocaleFor(taiwan),
    provider: providerLanguageFor(taiwan),
  }).toEqual({
    url: "/zh-tw",
    bcp47: "zh-TW",
    bundle: "zh-tw",
    provider: "ZH_TW",
  });

  // And a market where they legitimately coincide still works.
  const german = resolveLocale("/de-de/cart");
  expect({
    url: german.pathPrefix,
    bcp47: german.hreflang,
    bundle: bundleLocaleFor(german),
    provider: providerLanguageFor(german),
  }).toEqual({
    url: "/de-de",
    bcp47: "de-DE",
    bundle: "de",
    provider: "DE",
  });
});
