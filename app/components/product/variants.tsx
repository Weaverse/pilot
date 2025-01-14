import { VariantSelector } from "@shopify/hydrogen";
import type {
  ProductOptionFragment,
  ProductVariantFragment,
} from "storefront-api.generated";
import { VariantOption } from "./variant-option";

interface ProductVariantsProps {
  productHandle: string;
  variants: ProductVariantFragment[];
  options: ProductOptionFragment[];
  hideUnavailableOptions?: boolean;
}

export function ProductVariants(props: ProductVariantsProps) {
  let { productHandle, variants, options, hideUnavailableOptions } = props;

  return (
    <div className="space-y-6" data-motion="fade-up">
      <VariantSelector
        handle={productHandle}
        variants={variants}
        options={options}
      >
        {({ option }) => {
          let values = option.values
            .map((optionValue) => {
              let { variant } = optionValue;
              if (!variant && hideUnavailableOptions) {
                return null;
              }
              return {
                ...optionValue,
                isUnavailable: !variant || !variant.availableForSale,
              };
            })
            .filter(Boolean);

          return (
            <div className="space-y-2">
              <legend>
                <span className="font-bold">{option.name}:</span>
                <span className="ml-1.5">{option.value}</span>
              </legend>
              <VariantOption option={{ ...option, values }} />
            </div>
          );
        }}
      </VariantSelector>
    </div>
  );
}
