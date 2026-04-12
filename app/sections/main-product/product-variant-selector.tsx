import {
  getAdjacentAndFirstAvailableVariants,
  getProductOptions,
  useOptimisticVariant,
} from "@shopify/hydrogen";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { ProductVariants } from "./variants";

interface ProductVariantSelectorProps extends HydrogenComponentProps {
}

export default function ProductVariantSelector(
  props: ProductVariantSelectorProps,
) {
  const { ...rest } = props;
  const { product } = useLoaderData<typeof productRouteLoader>();

  const selectedVariant = useOptimisticVariant(
    product?.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  if (!product) {
    return null;
  }

  return (
    <div {...rest}>
      <ProductVariants
        productOptions={productOptions}
        selectedVariant={selectedVariant}
      />
    </div>
  );
}

export const schema = createSchema({
  type: "mp--variant-selector",
  title: "Variant selector",
  limit: 1,
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [],
});
