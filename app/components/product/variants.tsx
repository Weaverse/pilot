import { VariantSelector } from "@shopify/hydrogen";
import { useSearchParams } from "react-router";
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
  const { productHandle, variants, options, hideUnavailableOptions } = props;
  const [params] = useSearchParams();
  const allOptionNames = options.map((option) => option.name);
  const selectedOptionsInParams = allOptionNames
    .map((name) => {
      const value = params.get(name);
      return value ? { name, value } : null;
    })
    .filter(Boolean);

  let hasOnlyDefaultVariant = false;
  if (options.length === 1) {
    const { name, optionValues } = options[0];
    if (name === "Title" && optionValues.length === 1) {
      const { name: optionValueName } = optionValues[0];
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
          const otherOptionsSelected =
            selectedOptionsInParams.filter(
              (selectedOption) => selectedOption.name !== option.name,
            ).length ===
            allOptionNames.length - 1;

          const values = option.values
            .map((optionValue) => {
              const { variant } = optionValue;
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
