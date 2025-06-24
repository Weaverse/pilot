import type { MappedProductOptions } from "@shopify/hydrogen";
import { VariantOption } from "./variant-option";

interface ProductFormProps {
  productOptions: MappedProductOptions[];
}

export function ProductForm({ productOptions }: ProductFormProps) {
  return (
    <div className="product-form space-y-5">
      {productOptions.map((option) => {
        // Map optionValues to VariantOption expected shape
        const variantOption = {
          name: option.name,
          values: option.optionValues.map((value) => ({
            value: value.name,
            to: value.isDifferentProduct
              ? `/products/${value.handle}?${value.variantUriQuery}`
              : `?${value.variantUriQuery}`,
            isActive: value.selected,
            isUnavailable: !value.available,
            isAvailable: value.available,
            isDifferentProduct: value.isDifferentProduct,
            search: value.name, // fallback, adjust if needed
            optionValue: {
              swatch: value.swatch,
              firstSelectableVariant: value.firstSelectableVariant,
            },
          })),
        };
        return (
          <div className="product-options space-y-1.5" key={option.name}>
            <legend className="leading-tight">
              <span className="font-bold">{option.name}</span>
            </legend>
            <VariantOption option={variantOption} />
          </div>
        );
      })}
    </div>
  );
}
