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
}: {
  product: NonNullable<ProductQuery["product"]>;
  selectedVariant: ProductVariantFragment;
  setSelectedVariant: (variant: ProductVariantFragment) => void;
}) {
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  if (productOptions.length === 0 || hasOnlyDefaultVariant(productOptions)) {
    return null;
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
            />
          </div>
        );
      })}
    </div>
  );
}
