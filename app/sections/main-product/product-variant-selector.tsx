import {
  createSchema,
  type WeaverseComponentProps,
} from "@weaverse/hydrogen/react-router";
import { useLoaderData } from "react-router";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { ProductVariants } from "./variants";

interface ProductVariantSelectorProps extends WeaverseComponentProps {}

export default function ProductVariantSelector(
  props: ProductVariantSelectorProps,
) {
  const { ...rest } = props;
  const { product } = useLoaderData<typeof productRouteLoader>();

  if (!product) {
    return null;
  }

  return (
    <div {...rest}>
      <ProductVariants product={product} />
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
