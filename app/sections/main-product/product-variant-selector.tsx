import {
  getAdjacentAndFirstAvailableVariants,
  getProductOptions,
  useOptimisticVariant,
} from "@shopify/hydrogen";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { isCombinedListing } from "~/utils/combined-listings";
import { ProductVariants } from "./variants";

interface ProductVariantSelectorProps extends HydrogenComponentProps {
  ref: React.Ref<HTMLDivElement>;
}

export default function ProductVariantSelector(
  props: ProductVariantSelectorProps,
) {
  const { ref, ...rest } = props;
  const { product } = useLoaderData<typeof productRouteLoader>();

  const selectedVariant = useOptimisticVariant(
    product?.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const combinedListing = isCombinedListing(product);

  if (!product) {
    return null;
  }

  return (
    <div ref={ref} {...rest}>
      <ProductVariants
        productOptions={productOptions}
        selectedVariant={selectedVariant}
        combinedListing={combinedListing}
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
