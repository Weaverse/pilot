import {
  getAdjacentAndFirstAvailableVariants,
  ShopPayButton,
  useOptimisticVariant,
} from "@shopify/hydrogen";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useLoaderData } from "react-router";
import { create } from "zustand";
import { AddToCartButton } from "~/components/product/add-to-cart-button";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { useProductQtyStore } from "./product-quantity-selector";

export const useATCVisibilityStore = create<{
  inView: boolean;
  setInView: (value: boolean) => void;
}>()((set) => ({
  inView: true,
  setInView: (value: boolean) => set({ inView: value }),
}));

interface ProductATCButtonsProps extends HydrogenComponentProps {
  ref: React.Ref<HTMLDivElement>;
  addToCartText: string;
  addBundleToCartText: string;
  soldOutText: string;
  showShopPayButton: boolean;
}

export default function ProductATCButtons(props: ProductATCButtonsProps) {
  const {
    ref: weaverseRef,
    addToCartText,
    addBundleToCartText,
    soldOutText,
    showShopPayButton,
    ...rest
  } = props;
  const { product, storeDomain } = useLoaderData<typeof productRouteLoader>();
  const { quantity } = useProductQtyStore();
  const { setInView } = useATCVisibilityStore();

  const { ref: inViewRef, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    setInView(inView);
  }, [inView, setInView]);

  const selectedVariant = useOptimisticVariant(
    product?.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  const isBundle = Boolean(product?.isBundle?.requiresComponents);

  if (!product) {
    return null;
  }

  let atcButtonText = "Add to cart";
  if (selectedVariant.availableForSale) {
    atcButtonText = isBundle ? addBundleToCartText : addToCartText;
  } else {
    atcButtonText = soldOutText;
  }

  return (
    <div
      {...rest}
      ref={(node) => {
        inViewRef(node);
        if (typeof weaverseRef === "function") {
          weaverseRef(node);
        } else if (weaverseRef) {
          (weaverseRef as React.RefObject<HTMLDivElement | null>).current =
            node;
        }
      }}
      className="space-y-2 empty:hidden"
    >
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
}

export const schema = createSchema({
  type: "mp--atc-buttons",
  title: "Buy buttons",
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
          helpText:
            "Apply if the product is a bundled product. Learn more about <a href='https://shopify.dev/docs/apps/build/product-merchandising/bundles' target='_blank'>Shopify product bundles</a>.",
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
