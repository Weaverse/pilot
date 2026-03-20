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
              onVariantChange={(newVariant: ProductVariantFragment) => {
                setSelectedVariant(newVariant);
              }}
              variantMap={variantMap}
              selectedOptions={selectedOptions}
            />
          </div>
        );
      })}
    </div>
  );
}
