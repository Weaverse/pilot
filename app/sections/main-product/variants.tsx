import { ProductOptionValues } from "~/components/product/product-option-values";
import {
  type ProductFormData,
  useProduct,
} from "~/components/product/product-form";
import { ScrollReveal } from "~/components/scroll-reveal";
import { hasOnlyDefaultVariant } from "~/utils/product";

/**
 * The product page's option picker. Values are links to their option URLs;
 * selecting one updates the product form in place and the route's
 * `ProductProvider` syncs the URL.
 */
export function ProductVariants({ product }: { product: ProductFormData }) {
  const { options } = useProduct();

  if (hasOnlyDefaultVariant(product.options)) {
    return null;
  }

  return (
    <ScrollReveal className="product-form space-y-5">
      {options.map((option) => {
        const selected = option.values.find((value) => value.selected);
        return (
          <div className="product-options space-y-2" key={option.name}>
            <legend className="leading-tight">
              <span className="font-bold">{option.name}</span>
              {selected && <span>: {selected.name}</span>}
            </legend>
            <ProductOptionValues product={product} option={option} asLinks />
          </div>
        );
      })}
    </ScrollReveal>
  );
}
