import {
  getAdjacentAndFirstAvailableVariants,
  useOptimisticVariant,
} from "@shopify/hydrogen";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import { VariantPrices } from "~/components/product/variant-prices";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { isCombinedListing } from "~/utils/combined-listings";

interface ProductPricesProps extends HydrogenComponentProps {
  ref: React.Ref<HTMLDivElement>;
  showCompareAtPrice: boolean;
}

export default function ProductPrices(props: ProductPricesProps) {
  const { ref, showCompareAtPrice, ...rest } = props;
  const { product } = useLoaderData<typeof productRouteLoader>();

  const selectedVariant = useOptimisticVariant(
    product?.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  const combinedListing = isCombinedListing(product);

  if (!product) {
    return null;
  }

  return (
    <div ref={ref} {...rest}>
      {combinedListing ? (
        <div className="flex gap-2 text-2xl/none">
          <span className="flex gap-1">
            From
            <VariantPrices
              variant={{ price: product.priceRange.minVariantPrice }}
              showCompareAtPrice={false}
            />
          </span>
          <span className="flex gap-1">
            To
            <VariantPrices
              variant={{ price: product.priceRange.maxVariantPrice }}
              showCompareAtPrice={false}
            />
          </span>
        </div>
      ) : (
        <VariantPrices
          variant={selectedVariant}
          showCompareAtPrice={showCompareAtPrice}
          className="text-2xl/none"
        />
      )}
    </div>
  );
}

export const schema = createSchema({
  type: "mp--prices",
  title: "Prices",
  limit: 1,
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [
    {
      group: "General",
      inputs: [
        {
          type: "switch",
          label: "Show compare at price",
          name: "showCompareAtPrice",
          defaultValue: true,
        },
      ],
    },
  ],
});
