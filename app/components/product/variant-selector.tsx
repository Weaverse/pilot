import { getProductOptions } from "@shopify/hydrogen";
import type {
  ProductQuery,
  ProductVariantFragment,
} from "storefront-api.generated";
import { ProductOptionValues } from "~/components/product/product-option-values";
import { hasOnlyDefaultVariant } from "~/utils/product";

/**
 * Resolves the correct variant when an option value is clicked.
 * Looks up the variant matching all currently selected options with only the
 * clicked option changed. Falls back to firstSelectableVariant if no match.
 */
function resolveVariant(
  optionName: string,
  clickedValue: string,
  variantMap: Map<string, ProductVariantFragment>,
  selectedOptions: Array<{ name: string; value: string }>,
): ProductVariantFragment | undefined {
  const targetOptions = selectedOptions.map((o) =>
    o.name === optionName ? { ...o, value: clickedValue } : o,
  );
  const key = targetOptions
    .map((o) => `${o.name}=${o.value}`)
    .sort()
    .join("&");
  return variantMap.get(key);
}

export function VariantSelector({
  product,
  selectedVariant,
  setSelectedVariant,
  variants,
}: {
  product: NonNullable<ProductQuery["product"]>;
  selectedVariant: ProductVariantFragment;
  setSelectedVariant: (variant: ProductVariantFragment) => void;
  variants?: ProductVariantFragment[];
}) {
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  if (productOptions.length === 0 || hasOnlyDefaultVariant(productOptions)) {
    return null;
  }

  // Build a lookup map from all variants for correct option resolution
  const variantMap = new Map<string, ProductVariantFragment>();
  if (variants) {
    for (const v of variants) {
      const key = v.selectedOptions
        .map((o) => `${o.name}=${o.value}`)
        .sort()
        .join("&");
      variantMap.set(key, v);
    }
  }

  const selectedOptions = selectedVariant?.selectedOptions || [];

  function handleOptionChange(optionName: string, value: string) {
    const resolved = variantMap.size
      ? resolveVariant(optionName, value, variantMap, selectedOptions)
      : undefined;
    // Fall back to firstSelectableVariant from the option values
    const fallback = productOptions
      .find((o) => o.name === optionName)
      ?.optionValues.find((v) => v.name === value)?.firstSelectableVariant;
    const variant = resolved || fallback;
    if (variant) {
      setSelectedVariant(variant);
    }
  }

  return (
    <div className="space-y-4">
      {productOptions.map((option) => {
        const { name } = option;
        const selected = selectedOptions.find((opt) => opt.name === name);
        return (
          <div className="space-y-2" key={name}>
            <legend className="leading-tight">
              <span className="font-bold">{name}</span>
              {selected?.value && <span>: {selected.value}</span>}
            </legend>
            <ProductOptionValues
              option={option}
              onOptionChange={handleOptionChange}
            />
          </div>
        );
      })}
    </div>
  );
}
