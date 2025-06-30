import type { MappedProductOptions } from "@shopify/hydrogen";
import { ProductOptionValues } from "./product-option-values";

export function ProductForm({
  productOptions,
}: {
  productOptions: MappedProductOptions[];
}) {
  return (
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
  );
}
