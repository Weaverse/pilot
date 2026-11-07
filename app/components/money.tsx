import { formatMoney, type MoneyV2 } from "@shopify/hydrogen";
import type {
  ComponentPropsWithoutRef,
  ElementType,
  JSX,
  ReactNode,
} from "react";

/**
 * Locale every price is formatted with.
 *
 * Classic Hydrogen's `useMoney()` read the locale from `useShop()`. Pilot never
 * rendered `<ShopifyProvider>`, so it always fell back to hydrogen-react's
 * default context (`languageIsoCode: "EN"`, `countryIsoCode: "US"`), i.e.
 * `en-US` for every market. Kept as-is so prices render exactly as on `main`
 * (`€10.00`, `CA$10.00`, `¥1,000`); switching to the market locale is a
 * visible formatting change and belongs in its own PR.
 */
const MONEY_LOCALE = "en-US";

type MoneyData = Partial<MoneyV2>;

/**
 * Drop-in replacement for classic hydrogen-react's `useMoney()`, built on
 * Hydrogen's `formatMoney()`. Exposes the same fields Pilot reads
 * (`localizedString`, `withoutTrailingZeros`, `withoutTrailingZerosAndCurrency`,
 * `currencyNarrowSymbol`, `currencySymbol`, `currencyName`, `amount`, `parts`).
 */
export function useMoney(money: MoneyData) {
  return formatMoney(
    { amount: money.amount ?? "", currencyCode: money.currencyCode ?? "" },
    { locale: MONEY_LOCALE },
  );
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
