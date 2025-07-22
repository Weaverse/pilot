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

function Badge({
  text,
  backgroundColor,
  className,
}: {
  text: string;
  backgroundColor: string;
  className?: string;
}) {
  const { colorText, colorTextInverse, badgeBorderRadius, badgeTextTransform } =
    useThemeSettings();
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
  className,
}: {
  publishedAt: string;
  className?: string;
}) {
  const { newBadgeText, newBadgeColor, newBadgeDaysOld } = useThemeSettings();
  if (isNewArrival(publishedAt, newBadgeDaysOld)) {
    return (
      <Badge
        text={newBadgeText}
        backgroundColor={newBadgeColor}
        className={clsx("new-badge", className)}
      />
    );
  }
  return null;
}

export function BestSellerBadge({ className }: { className?: string }) {
  const { bestSellerBadgeText, bestSellerBadgeColor } = useThemeSettings();
  return (
    <Badge
      text={bestSellerBadgeText}
      backgroundColor={bestSellerBadgeColor}
      className={clsx("best-seller-badge", className)}
    />
  );
}

export function SoldOutBadge({ className }: { className?: string }) {
  const { soldOutBadgeText, soldOutBadgeColor } = useThemeSettings();
  return (
    <Badge
      text={soldOutBadgeText}
      backgroundColor={soldOutBadgeColor}
      className={clsx("sold-out-badge", className)}
    />
  );
}

export function BundleBadge({ className }: { className?: string }) {
  const { bundleBadgeText, bundleBadgeColor } = useThemeSettings();
  return (
    <Badge
      text={bundleBadgeText}
      backgroundColor={bundleBadgeColor}
      className={clsx("bundle-badge", className)}
    />
  );
}

export function SaleBadge({
  price,
  compareAtPrice,
  className,
}: {
  price: MoneyV2;
  compareAtPrice: MoneyV2;
  className?: string;
}) {
  const { saleBadgeText = "Sale", saleBadgeColor } = useThemeSettings();
  const { amount, percentage } = calculateDiscount(price, compareAtPrice);
  const discountAmount = useMoney({ amount, currencyCode: price.currencyCode });
  const text = saleBadgeText
    .replace("[amount]", discountAmount.withoutTrailingZeros)
    .replace("[percentage]", percentage);

  if (percentage !== "0") {
    return (
      <Badge
        text={text}
        backgroundColor={saleBadgeColor}
        className={clsx("sale-badge", className)}
      />
    );
  }
  return null;
}

function calculateDiscount(price: MoneyV2, compareAtPrice: MoneyV2) {
  if (price?.amount && compareAtPrice?.amount) {
    const priceNumber = Number(price.amount);
    const compareAtPriceNumber = Number(compareAtPrice.amount);
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
}: {
  product: NonNullable<ProductQuery["product"]>;
  selectedVariant: ProductVariantFragment;
  className?: string;
}) {
  if (!(product && selectedVariant)) {
    return null;
  }

  const isBundle = Boolean(product?.isBundle?.requiresComponents);
  const { publishedAt, badges } = product;
  const isBestSellerProduct = badges
    .filter(Boolean)
    .some(({ key, value }) => key === "best_seller" && value === "true");

  return (
    <div
      className={cn("flex items-center gap-2 text-sm empty:hidden", className)}
    >
      {selectedVariant.availableForSale ? (
        <>
          {isBundle && <BundleBadge />}
          <SaleBadge
            price={selectedVariant.price as MoneyV2}
            compareAtPrice={selectedVariant.compareAtPrice as MoneyV2}
          />
          <NewBadge publishedAt={publishedAt} />
          {isBestSellerProduct && <BestSellerBadge />}
        </>
      ) : (
        <SoldOutBadge />
      )}
    </div>
  );
}
