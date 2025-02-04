import { useMoney } from "@shopify/hydrogen";
import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";
import { useThemeSettings } from "@weaverse/hydrogen";
import { clsx } from "clsx";
import { colord } from "colord";

function Badge({
  text,
  backgroundColor,
  className,
}: {
  text: string;
  backgroundColor: string;
  className?: string;
}) {
  let { colorText, colorTextInverse, badgeBorderRadius, badgeTextTransform } =
    useThemeSettings();
  return (
    <span
      style={{
        backgroundColor,
        color: colord(backgroundColor).isDark() ? colorTextInverse : colorText,
        borderRadius: `${badgeBorderRadius}px`,
        textTransform: badgeTextTransform,
      }}
      className={clsx("px-1.5 py-1 uppercase text-sm", className)}
    >
      {text}
    </span>
  );
}

export function NewBadge({
  publishedAt,
  className,
}: { publishedAt: string; className?: string }) {
  let { newBadgeText, newBadgeColor, newBadgeDaysOld } = useThemeSettings();
  if (isNewArrival(publishedAt, newBadgeDaysOld)) {
    return (
      <Badge
        text={newBadgeText}
        backgroundColor={newBadgeColor}
        className={className}
      />
    );
  }
  return null;
}

export function BestSellerBadge({ className }: { className?: string }) {
  let { bestSellerBadgeText, bestSellerBadgeColor } = useThemeSettings();
  return (
    <Badge
      text={bestSellerBadgeText}
      backgroundColor={bestSellerBadgeColor}
      className={className}
    />
  );
}

export function SoldOutBadge({ className }: { className?: string }) {
  let { soldOutBadgeText, soldOutBadgeColor } = useThemeSettings();
  return (
    <Badge
      text={soldOutBadgeText}
      backgroundColor={soldOutBadgeColor}
      className={className}
    />
  );
}

export function SaleBadge({
  price,
  compareAtPrice,
  className,
}: { price: MoneyV2; compareAtPrice: MoneyV2; className?: string }) {
  let { saleBadgeText = "Sale", saleBadgeColor } = useThemeSettings();
  let { amount, percentage } = calculateDiscount(price, compareAtPrice);
  let discountAmount = useMoney({ amount, currencyCode: price.currencyCode });
  let text = saleBadgeText
    .replace("[amount]", discountAmount.withoutTrailingZeros)
    .replace("[percentage]", percentage);

  if (percentage !== "0") {
    return (
      <Badge
        text={text}
        backgroundColor={saleBadgeColor}
        className={className}
      />
    );
  }
  return null;
}

function calculateDiscount(price: MoneyV2, compareAtPrice: MoneyV2) {
  if (price?.amount && compareAtPrice?.amount) {
    let priceNumber = Number(price.amount);
    let compareAtPriceNumber = Number(compareAtPrice.amount);
    if (compareAtPriceNumber > priceNumber) {
      return {
        amount: String(compareAtPriceNumber - priceNumber),
        percentage: Math.round(
          ((compareAtPriceNumber - priceNumber) / compareAtPriceNumber) * 100,
        ).toString(),
      };
    }
  }
  return { amount: "0", percentage: "0" };
}

function isNewArrival(date: string, daysOld = 30) {
  return (
    new Date(date).valueOf() >
    new Date().setDate(new Date().getDate() - daysOld).valueOf()
  );
}
