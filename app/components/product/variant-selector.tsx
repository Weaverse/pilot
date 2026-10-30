import { ProductOptionValues } from "~/components/product/product-option-values";
import {
  type ProductFormData,
  useProduct,
} from "~/components/product/product-form";
import { hasOnlyDefaultVariant } from "~/utils/product";

/**
 * Option picker for product forms that select in place (quick shop, the
 * single-product section): the page URL stays as it is.
 */
export function VariantSelector({ product }: { product: ProductFormData }) {
  const { options } = useProduct();

  if (options.length === 0 || hasOnlyDefaultVariant(product.options)) {
    return null;
  }

  return (
    <div className="space-y-4">
      {options.map((option) => {
        const selected = option.values.find((value) => value.selected);
        return (
          <div className="space-y-2" key={option.name}>
            <legend className="leading-tight">
              <span className="font-bold">{option.name}</span>
              {selected && <span>: {selected.name}</span>}
            </legend>
            <ProductOptionValues product={product} option={option} />
          </div>
        );
      })}
    </div>
  );
}
