import { VariantSelector } from "@shopify/hydrogen";
import type {
  ProductQuery,
  ProductVariantFragmentFragment,
} from "storefrontapi.generated";
import { VariantOption } from "./options";

interface ProductVariantsProps {
  selectedVariant: ProductVariantFragmentFragment;
  onSelectedVariantChange: (variant: ProductVariantFragmentFragment) => void;
  variants: {
    nodes: ProductVariantFragmentFragment[];
  };
  handle: string;
  product: NonNullable<ProductQuery["product"]>;
  options: NonNullable<ProductQuery["product"]>["options"];
  hideUnavailableOptions?: boolean;
}

export function ProductVariants(props: ProductVariantsProps) {
  let {
    selectedVariant,
    onSelectedVariantChange,
    options,
    variants,
    handle,
    hideUnavailableOptions,
  } = props;

  let selectedOptions = selectedVariant?.selectedOptions;
  let nodes = variants?.nodes;
  let handleSelectOption = (optionName: string, value: string) => {
    let newSelectedOptions = selectedOptions?.map((opt) => {
      if (opt.name === optionName) {
        return {
          ...opt,
          value,
        };
      }
      return opt;
    });
    let newSelectedVariant = nodes?.find((variant) => {
      let variantOptions = variant.selectedOptions;
      let isMatch = true;
      for (let i = 0; i < variantOptions.length; i++) {
        if (variantOptions[i].value !== newSelectedOptions?.[i].value) {
          isMatch = false;
          break;
        }
      }
      return isMatch;
    });
    if (!newSelectedVariant) {
      newSelectedVariant = {
        ...selectedVariant,
        selectedOptions: newSelectedOptions,
        availableForSale: false,
        quantityAvailable: -1,
      };
    }
    onSelectedVariantChange(newSelectedVariant);
  };

  let selectedOptionMap = new Map();

  for (const opt of selectedOptions || []) {
    selectedOptionMap.set(opt.name, opt.value);
  }

  return (
    <div className="space-y-6">
      <VariantSelector
        handle={handle}
        variants={nodes}
        options={options.filter((option) => option.values.length > 1)}
      >
        {({ option }) => {
          let optionName = option.name;
          let clonedSelectedOptionMap = new Map(selectedOptionMap);
          let values = option.values
            .map((value) => {
              clonedSelectedOptionMap.set(optionName, value.value);
              let variant = nodes?.find((variant) => {
                return variant.selectedOptions.every((opt) => {
                  return opt.value === clonedSelectedOptionMap.get(opt.name);
                });
              });
              if (hideUnavailableOptions && !variant) {
                return null;
              }
              return {
                ...value,
                isAvailable: variant ? variant.availableForSale : false,
                image: variant?.image,
              };
            })
            .filter(Boolean);
          let handleSelectOptionValue = (value: string) =>
            handleSelectOption(optionName, value);
          let selectedValue = selectedOptions?.find(
            (opt) => opt.name === optionName,
          )?.value;

          return (
            <VariantOption
              name={optionName}
              values={values}
              selectedOptionValue={selectedValue || ""}
              onSelectOptionValue={handleSelectOptionValue}
            />
          );
        }}
      </VariantSelector>
    </div>
  );
}
