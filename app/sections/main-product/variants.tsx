import type { MappedProductOptions } from "@shopify/hydrogen";
import type { ProductVariantFragment } from "storefront-api.generated";
import { ProductOptionValues } from "~/components/product/product-option-values";
import { hasOnlyDefaultVariant } from "~/utils/product";

export function ProductVariants({
  productOptions,
  selectedVariant,
  combinedListing,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductVariantFragment;
  combinedListing?: boolean;
}) {
  if (hasOnlyDefaultVariant(productOptions)) {
    return null;
  }

  const selectedOptions = selectedVariant?.selectedOptions || [];

  return (
    <div className="space-y-5" data-motion="fade-up">
      <div className="product-form space-y-5">
        {productOptions.map((option) => {
          const { name } = option;
          const selected = selectedOptions.find((opt) => opt.name === name);
          return (
            <div className="product-options space-y-2" key={name}>
              <legend className="leading-tight">
                <span className="font-bold">{name}</span>
                {selected?.value && <span>: {selected.value}</span>}
              </legend>
              <ProductOptionValues
                option={option}
                combinedListing={combinedListing}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
