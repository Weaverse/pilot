import { useMoney } from "@shopify/hydrogen";
import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";
import { useThemeSettings } from "@weaverse/hydrogen";
import clsx from "clsx";
import { colord } from "colord";
import type {
  ProductQuery,
  ProductVariantFragment,
} from "storefront-api.generated";
import { cn } from "~/utils/cn";

export interface BadgeStyleSettings {
  colorText: string;
  colorTextInverse: string;
  badgeBorderRadius: number;
  badgeTextTransform: string;
}

function Badge({
  text,
  backgroundColor,
  badgeStyle,
  className,
}: {
  text: string;
  backgroundColor: string;
  badgeStyle: BadgeStyleSettings;
  className?: string;
}) {
  let { colorText, colorTextInverse, badgeBorderRadius, badgeTextTransform } =
    badgeStyle;
  return (
    <span
      style={{
        backgroundColor,
        color: colord(backgroundColor).isDark() ? colorTextInverse : colorText,
        borderRadius: `${badgeBorderRadius}px`,
        textTransform: badgeTextTransform,
      }}
      className={cn("px-1.5 py-1 text-sm uppercase", className)}
    >
      {text}
    </span>
  );
}

export function NewBadge({
  publishedAt,
  badgeStyle,
  newBadgeText,
  newBadgeColor,
  newBadgeDaysOld,
  className,
}: {
  publishedAt: string;
  badgeStyle: BadgeStyleSettings;
  newBadgeText: string;
  newBadgeColor: string;
  newBadgeDaysOld: number;
  className?: string;
}) {
  if (isNewArrival(publishedAt, newBadgeDaysOld)) {
    return (
      <Badge
        text={newBadgeText}
        backgroundColor={newBadgeColor}
        badgeStyle={badgeStyle}
        className={clsx("new-badge", className)}
      />
    );
  }
  return null;
}

export function BestSellerBadge({
  badgeStyle,
  bestSellerBadgeText,
  bestSellerBadgeColor,
  className,
}: {
  badgeStyle: BadgeStyleSettings;
  bestSellerBadgeText: string;
  bestSellerBadgeColor: string;
  className?: string;
}) {
  return (
    <Badge
      text={bestSellerBadgeText}
      backgroundColor={bestSellerBadgeColor}
      badgeStyle={badgeStyle}
      className={clsx("best-seller-badge", className)}
    />
  );
}

export function SoldOutBadge({
  badgeStyle,
  soldOutBadgeText,
  soldOutBadgeColor,
  className,
}: {
  badgeStyle: BadgeStyleSettings;
  soldOutBadgeText: string;
  soldOutBadgeColor: string;
  className?: string;
}) {
  return (
    <Badge
      text={soldOutBadgeText}
      backgroundColor={soldOutBadgeColor}
      badgeStyle={badgeStyle}
      className={clsx("sold-out-badge", className)}
    />
  );
}

export function BundleBadge({
  badgeStyle,
  bundleBadgeText,
  bundleBadgeColor,
  className,
}: {
  badgeStyle: BadgeStyleSettings;
  bundleBadgeText: string;
  bundleBadgeColor: string;
  className?: string;
}) {
  return (
    <Badge
      text={bundleBadgeText}
      backgroundColor={bundleBadgeColor}
      badgeStyle={badgeStyle}
      className={clsx("bundle-badge", className)}
    />
  );
}

export function SaleBadge({
  price,
  compareAtPrice,
  badgeStyle,
  saleBadgeText = "Sale",
  saleBadgeColor,
  className,
}: {
  price: MoneyV2;
  compareAtPrice: MoneyV2;
  badgeStyle: BadgeStyleSettings;
  saleBadgeText?: string;
  saleBadgeColor: string;
  className?: string;
}) {
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
        badgeStyle={badgeStyle}
        className={clsx("sale-badge", className)}
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

export function ProductBadges({
  product,
  selectedVariant,
  className = "",
  as: Component = "div",
}: {
  product: NonNullable<ProductQuery["product"]>;
  selectedVariant: ProductVariantFragment;
  className?: string;
  as?: React.ElementType;
}) {
  let {
    colorText,
    colorTextInverse,
    badgeBorderRadius,
    badgeTextTransform,
    newBadgeText,
    newBadgeColor,
    newBadgeDaysOld,
    bestSellerBadgeText,
    bestSellerBadgeColor,
    soldOutBadgeText,
    soldOutBadgeColor,
    bundleBadgeText,
    bundleBadgeColor,
    saleBadgeText,
    saleBadgeColor,
  } = useThemeSettings();

  let badgeStyle: BadgeStyleSettings = {
    colorText,
    colorTextInverse,
    badgeBorderRadius,
    badgeTextTransform,
  };

  if (!(product && selectedVariant)) {
    return null;
  }

  let isBundle = Boolean(product?.isBundle?.requiresComponents);
  let { publishedAt, badges } = product;
  let isBestSellerProduct = badges
    .filter(Boolean)
    .some(({ key, value }) => key === "best_seller" && value === "true");

  let isFragment = Component.toString() === "Symbol(react.fragment)";
  let componentProps = isFragment
    ? {}
    : {
        className: cn(
          "flex items-center gap-2 text-sm empty:hidden",
          className,
        ),
      };

  return (
    <Component {...componentProps}>
      {selectedVariant.availableForSale ? (
        <>
          {isBundle && (
            <BundleBadge
              badgeStyle={badgeStyle}
              bundleBadgeText={bundleBadgeText}
              bundleBadgeColor={bundleBadgeColor}
            />
          )}
          <SaleBadge
            price={selectedVariant.price as MoneyV2}
            compareAtPrice={selectedVariant.compareAtPrice as MoneyV2}
            badgeStyle={badgeStyle}
            saleBadgeText={saleBadgeText}
            saleBadgeColor={saleBadgeColor}
          />
          <NewBadge
            publishedAt={publishedAt}
            badgeStyle={badgeStyle}
            newBadgeText={newBadgeText}
            newBadgeColor={newBadgeColor}
            newBadgeDaysOld={newBadgeDaysOld}
          />
          {isBestSellerProduct && (
            <BestSellerBadge
              badgeStyle={badgeStyle}
              bestSellerBadgeText={bestSellerBadgeText}
              bestSellerBadgeColor={bestSellerBadgeColor}
            />
          )}
        </>
      ) : (
        <SoldOutBadge
          badgeStyle={badgeStyle}
          soldOutBadgeText={soldOutBadgeText}
          soldOutBadgeColor={soldOutBadgeColor}
        />
      )}
    </Component>
  );
}
