import type { MappedProductOptions } from "@shopify/hydrogen";
import { ProductOptionValues } from "./product-option-values";

export function ProductVariants({
  productOptions,
}: {
  productOptions: MappedProductOptions[];
}) {
  // Check if this is a default variant only product
  if (productOptions.length === 1) {
    const option = productOptions[0];
    if (option.name === "Title" && option.optionValues.length === 1) {
      const optionValue = option.optionValues[0];
      if (optionValue.name === "Default Title") {
        return null;
      }
    }
  }

  return (
    <div className="space-y-5" data-motion="fade-up">
      <div className="product-form space-y-5">
        {productOptions.map((option) => (
          <div className="product-options space-y-1.5" key={option.name}>
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
