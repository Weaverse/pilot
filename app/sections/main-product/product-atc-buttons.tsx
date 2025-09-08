import {
  getAdjacentAndFirstAvailableVariants,
  ShopPayButton,
  useOptimisticVariant,
} from "@shopify/hydrogen";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { useLoaderData } from "react-router";
import { AddToCartButton } from "~/components/product/add-to-cart-button";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";
import { isCombinedListing } from "~/utils/combined-listings";
import { useProductQuantity } from "./product-quantity-context";

interface ProductATCButtonsProps extends HydrogenComponentProps {
  addToCartText: string;
  addBundleToCartText: string;
  soldOutText: string;
  showShopPayButton: boolean;
}

const ProductATCButtons = forwardRef<HTMLDivElement, ProductATCButtonsProps>(
  (props, ref) => {
    const {
      addToCartText,
      addBundleToCartText,
      soldOutText,
      showShopPayButton,
      ...rest
    } = props;
    const { product, storeDomain } = useLoaderData<typeof productRouteLoader>();
    const { quantity } = useProductQuantity();

    const selectedVariant = useOptimisticVariant(
      product?.selectedOrFirstAvailableVariant,
      getAdjacentAndFirstAvailableVariants(product),
    );

    const combinedListing = isCombinedListing(product);
    const isBundle = Boolean(product?.isBundle?.requiresComponents);

    if (!product || combinedListing) return null;

    let atcButtonText = "Add to cart";
    if (selectedVariant.availableForSale) {
      atcButtonText = isBundle ? addBundleToCartText : addToCartText;
    } else {
      atcButtonText = soldOutText;
    }

    return (
      <div ref={ref} {...rest} className="space-y-2 empty:hidden">
        <AddToCartButton
          disabled={!selectedVariant?.availableForSale}
          lines={[
            {
              merchandiseId: selectedVariant?.id,
              quantity,
              selectedVariant,
            },
          ]}
          data-test="add-to-cart"
          className="w-full uppercase"
        >
          {atcButtonText}
        </AddToCartButton>
        {showShopPayButton && selectedVariant?.availableForSale && (
          <ShopPayButton
            width="100%"
            variantIdsAndQuantities={[
              {
                id: selectedVariant?.id,
                quantity,
              },
            ]}
            storeDomain={storeDomain}
          />
        )}
      </div>
    );
  },
);

export default ProductATCButtons;

export const schema = createSchema({
  type: "mp--atc-buttons",
  title: "ATC buttons",
  limit: 1,
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [
    {
      group: "General",
      inputs: [
        {
          type: "text",
          label: "Add to cart text",
          name: "addToCartText",
          defaultValue: "Add to cart",
          placeholder: "Add to cart",
        },
        {
          type: "text",
          label: "Bundle add to cart text",
          name: "addBundleToCartText",
          defaultValue: "Add bundle to cart",
          placeholder: "Add bundle to cart",
          helpText: "Apply if the product is a bundled product. Learn more about <a href='https://shopify.dev/docs/apps/build/product-merchandising/bundles' target='_blank'>Shopify product bundles</a>.",
        },
        {
          type: "text",
          label: "Sold out text",
          name: "soldOutText",
          defaultValue: "Sold out",
          placeholder: "Sold out",
        },
        {
          type: "switch",
          label: "Show Shop Pay button",
          name: "showShopPayButton",
          defaultValue: true,
        },
      ],
    },
  ],
});
