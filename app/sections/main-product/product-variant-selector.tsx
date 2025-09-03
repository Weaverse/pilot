import {
  getAdjacentAndFirstAvailableVariants,
  getProductOptions,
  useOptimisticVariant,
} from "@shopify/hydrogen";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { useLoaderData } from "react-router";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";
import { isCombinedListing } from "~/utils/combined-listings";
import { ProductVariants } from "./variants";

interface ProductVariantSelectorProps extends HydrogenComponentProps {}

const ProductVariantSelector = forwardRef<
  HTMLDivElement,
  ProductVariantSelectorProps
>((props, ref) => {
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

  if (!product) return null;

  return (
    <div ref={ref} {...props}>
      <ProductVariants
        productOptions={productOptions}
        selectedVariant={selectedVariant}
        combinedListing={combinedListing}
      />
    </div>
  );
});

export default ProductVariantSelector;

export const schema = createSchema({
  type: "mp--variant-selector",
  title: "Variant selector",
  limit: 1,
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [],
});