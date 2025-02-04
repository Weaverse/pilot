import { VariantSelector } from "@shopify/hydrogen";
import type {
  ProductOptionFragment,
  ProductVariantFragment,
} from "storefront-api.generated";
import { VariantOption } from "./variant-option";
import { useSearchParams } from "@remix-run/react";

interface ProductVariantsProps {
  productHandle: string;
  variants: ProductVariantFragment[];
  options: ProductOptionFragment[];
  hideUnavailableOptions?: boolean;
}

export function ProductVariants(props: ProductVariantsProps) {
  let { productHandle, variants, options, hideUnavailableOptions } = props;
  let [params] = useSearchParams();
  let allOptionNames = options.map((option) => option.name);
  let selectedOptionsInParams = allOptionNames
    .map((name) => {
      let value = params.get(name);
      return value ? { name, value } : null;
    })
    .filter(Boolean);

  let hasOnlyDefaultVariant = false;
  if (options.length === 1) {
    let { name, optionValues } = options[0];
    if (name === "Title" && optionValues.length === 1) {
      let { name: optionValueName } = optionValues[0];
      if (optionValueName === "Default Title") {
        hasOnlyDefaultVariant = true;
      }
    }
  }

  if (hasOnlyDefaultVariant) {
    return null;
  }

  return (
    <div className="space-y-5" data-motion="fade-up">
      <VariantSelector
        handle={productHandle}
        variants={variants}
        options={options}
      >
        {({ option }) => {
          let otherOptionsSelected =
            selectedOptionsInParams.filter(
              (selectedOption) => selectedOption.name !== option.name,
            ).length ===
            allOptionNames.length - 1;

          let values = option.values
            .map((optionValue) => {
              let { variant } = optionValue;
              if (!variant && hideUnavailableOptions) {
                return null;
              }
              return {
                ...optionValue,
                isUnavailable: otherOptionsSelected
                  ? !variant || !variant.availableForSale
                  : undefined,
              };
            })
            .filter(Boolean);

          return (
            <div className="space-y-1.5">
              <legend className="leading-tight">
                <span className="font-bold">{option.name}</span>
                {option.value && <span>: {option.value}</span>}
              </legend>
              <VariantOption option={{ ...option, values }} />
            </div>
          );
        }}
      </VariantSelector>
    </div>
  );
}
