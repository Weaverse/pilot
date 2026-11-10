import { expect, test } from "@playwright/test";
import { formatMarketMoney } from "../../app/components/money";
import { resolveLocale } from "../../app/utils/locale";

/**
 * Prices are written the way each market writes them (#208), from the
 * market's `hreflang`. `Intl` separates some amounts from their symbol with a
 * no-break space (U+00A0) or a narrow no-break space (U+202F); both are
 * normalized to a plain space so the expectations stay readable.
 */
function price(prefix: string, amount: string, currencyCode: string) {
  let money = formatMarketMoney(
    { amount, currencyCode },
    resolveLocale(prefix),
  );
  return {
    full: money.localizedString.replace(/\s/g, " "),
    short: money.withoutTrailingZeros.replace(/\s/g, " "),
  };
}

test("the default market keeps its en-US output", () => {
  expect(price("/", "1234.5", "USD").full).toBe("$1,234.50");
  expect(price("/", "10.0", "USD").short).toBe("$10");
});

test("European markets use their own separators and symbol placement", () => {
  expect(price("/de-de", "1234.5", "EUR").full).toBe("1.234,50 €");
  expect(price("/de-de", "12.0", "EUR").short).toBe("12 €");
  expect(price("/fr-fr", "1234.5", "EUR").full).toBe("1 234,50 €");
});

test("English markets abroad write prices like their country", () => {
  // Text follows the language, prices follow the country (#219).
  expect(price("/en-de", "1234.5", "EUR").full).toBe("1.234,50 €");
  expect(price("/en-fr", "1234.5", "EUR").full).toBe(
    price("/fr-fr", "1234.5", "EUR").full,
  );
  // Countries that already write prices the English way keep `hreflang`.
  expect(price("/en-au", "1234.5", "AUD").full).toBe("$1,234.50");
  expect(price("/en-in", "1234.5", "INR").full).toBe("₹1,234.50");
});

test("zero-decimal currencies never show minor units", () => {
  expect(price("/ja-jp", "1234.5", "JPY").full).toBe("￥1,235");
  expect(price("/en-jp", "1000.0", "JPY").full).toBe("¥1,000");
  expect(price("/de-de", "1000.0", "KRW").full).toBe("1.000 ₩");
});

test("Chinese markets format with their BCP-47 tag, not the provider code", () => {
  // `providerLanguage` is `ZH_CN`/`ZH_TW`, which `Intl` would reject.
  expect(price("/zh-cn", "1234.5", "CNY").full).toBe("¥1,234.50");
  expect(price("/zh-tw", "1234.5", "TWD").full).toBe("$1,234.50");
});
