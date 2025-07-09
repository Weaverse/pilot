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

  return (
    <div className="space-y-4">
      {productOptions.map((option) => (
        <div className="space-y-2" key={option.name}>
          <legend className="leading-tight">
            <span className="font-bold">{option.name}</span>
          </legend>
          <ProductOptionValues
            option={option}
            onVariantChange={(newVariant: ProductVariantFragment) => {
              setSelectedVariant(newVariant);
            }}
          />
        </div>
      ))}
    </div>
  );
}
