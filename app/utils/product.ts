import type { MappedProductOptions } from "@shopify/hydrogen";

export function hasOnlyDefaultVariant(
  productOptions: MappedProductOptions[] = [],
) {
  if (productOptions.length === 1) {
    const option = productOptions[0];
    if (option.name === "Title" && option.optionValues.length === 1) {
      const optionValue = option.optionValues[0];
      return optionValue.name === "Default Title";
    }
  }
  return false;
}
