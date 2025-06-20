import type { MappedProductOptions } from "@shopify/hydrogen";
import type { ProductQuery } from "storefront-api.generated";
import { ProductForm } from "./product-form";

interface ProductVariantsProps {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductQuery["product"]["selectedOrFirstAvailableVariant"];
}

export function ProductVariants(props: ProductVariantsProps) {
  const { productOptions, selectedVariant } = props;

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
      <ProductForm
        productOptions={productOptions}
        selectedVariant={selectedVariant}
      />
    </div>
  );
}
