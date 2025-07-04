import type { MappedProductOptions } from "@shopify/hydrogen";
import { ProductOptionValues } from "~/components/product/product-option-values";
import { hasOnlyDefaultVariant } from "~/utils/product";

export function ProductVariants({
  productOptions,
}: {
  productOptions: MappedProductOptions[];
}) {
  if (hasOnlyDefaultVariant(productOptions)) {
    return null;
  }

  return (
    <div className="space-y-5" data-motion="fade-up">
      <div className="product-form space-y-5">
        {productOptions.map((option) => (
          <div className="product-options space-y-2" key={option.name}>
            <legend className="leading-tight">
              <span className="font-bold">{option.name}</span>
            </legend>
            <ProductOptionValues option={option} />
          </div>
        ))}
      </div>
    </div>
  );
}
