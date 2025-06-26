import type { MappedProductOptions } from "@shopify/hydrogen";
import { VariantOption } from "./variant-option";

interface ProductFormProps {
  productOptions: MappedProductOptions[];
}

export function ProductForm({ productOptions }: ProductFormProps) {
  return (
    <div className="product-form space-y-5">
      {productOptions.map((option) => (
        <div className="product-options space-y-1.5" key={option.name}>
          <legend className="leading-tight">
            <span className="font-bold">{option.name}</span>
          </legend>
          <VariantOption option={option} />
        </div>
      ))}
    </div>
  );
}
