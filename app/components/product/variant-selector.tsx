import { getProductOptions } from "@shopify/hydrogen";
import type {
  ProductQuery,
  ProductVariantFragment,
} from "storefront-api.generated";
import { ProductOptionValues } from "~/components/product/product-option-values";
import { hasOnlyDefaultVariant } from "~/utils/product";

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

  const selectedOptions = selectedVariant?.selectedOptions || [];

  function handleOptionChange(optionName: string, value: string) {
    const targetOptions = selectedOptions.map((o) =>
      o.name === optionName ? { ...o, value } : o,
    );
    // Find the variant matching all current selections with the clicked option changed
    const resolved = variants?.find((v) =>
      v.selectedOptions.every((so) =>
        targetOptions.some((t) => t.name === so.name && t.value === so.value),
      ),
    );
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
