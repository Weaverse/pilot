import { formatMoney, type MoneyV2 } from "@shopify/hydrogen";
import type {
  ComponentPropsWithoutRef,
  ElementType,
  JSX,
  ReactNode,
} from "react";
import { useLocation } from "react-router";
import { type Locale, resolveLocale } from "~/utils/locale";

type MoneyData = Partial<MoneyV2>;

/**
 * Formats `money` the way `locale`'s market writes prices: `1.234,56 €` in
 * de-DE, `￥1,235` in ja-JP, `$1,234.56` in the default en-US market.
 *
 * Uses `hreflang`, not `language`: the provider code can be script-specific
 * (`ZH_CN`), which is not a BCP-47 tag and makes `Intl` throw.
 */
export function formatMarketMoney(money: MoneyData, locale: Locale) {
  return formatMoney(
    { amount: money.amount ?? "", currencyCode: money.currencyCode ?? "" },
    { locale: locale.hreflang },
  );
}

/**
 * Drop-in replacement for classic hydrogen-react's `useMoney()`, built on
 * Hydrogen's `formatMoney()` with the current market's locale. Exposes the
 * same fields Pilot reads (`localizedString`, `withoutTrailingZeros`,
 * `withoutTrailingZerosAndCurrency`, `currencySymbol`, `amount`, `parts`, ...).
 *
 * The market is read from the URL, like `usePrefixPathWithLocale`: the server
 * and the client see the same path, so both render the same string.
 */
export function useMoney(money: MoneyData) {
  let { pathname } = useLocation();
  return formatMarketMoney(money, resolveLocale(pathname));
}

type MoneyPropsBase<T extends ElementType> = {
  /** Element or component to render as the wrapper. Defaults to `div`. */
  as?: T;
  /** A Storefront / Customer Account API `MoneyV2`. */
  data: MoneyData;
  /** Remove the currency symbol from the output. */
  withoutCurrency?: boolean;
  /** Remove trailing zeros (`$10.00` → `$10`) from whole amounts. */
  withoutTrailingZeros?: boolean;
  /** A `UnitPriceMeasurement`; renders `{separator}{referenceUnit}` after the price. */
  measurement?: { referenceUnit?: string | null };
  /** Separator between the price and the measurement. Defaults to `/`. */
  measurementSeparator?: ReactNode;
};

export type MoneyProps<T extends ElementType = "div"> = MoneyPropsBase<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof MoneyPropsBase<T>>;

/**
 * Drop-in replacement for classic hydrogen-react's `<Money>`: same props, same
 * wrapper element and same rendered text.
 */
export function Money<T extends ElementType = "div">({
  data,
  as,
  withoutCurrency,
  withoutTrailingZeros,
  measurement,
  measurementSeparator = "/",
  ...passthroughProps
}: MoneyProps<T>): JSX.Element {
  if (!isMoney(data)) {
    throw new Error(
      `<Money/> needs a valid 'data' prop that has 'amount' and 'currencyCode'`,
    );
  }
  let money = useMoney(data);
  let Wrapper: ElementType = as ?? "div";
  let output = money.localizedString;
  if (withoutCurrency && withoutTrailingZeros) {
    output = money.withoutTrailingZerosAndCurrency;
  } else if (withoutCurrency) {
    output = money.amount;
  } else if (withoutTrailingZeros) {
    output = money.withoutTrailingZeros;
  }
  return (
    <Wrapper {...passthroughProps}>
      {output}
      {measurement?.referenceUnit && (
        <>
          {measurementSeparator}
          {measurement.referenceUnit}
        </>
      )}
    </Wrapper>
  );
}

function isMoney(money: MoneyData): money is MoneyV2 {
  return (
    typeof money.amount === "string" &&
    !!money.amount &&
    typeof money.currencyCode === "string" &&
    !!money.currencyCode
  );
}
