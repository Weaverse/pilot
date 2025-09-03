import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { ProductDetails } from "./product-details";

interface ProductDetailsAccordionProps extends HydrogenComponentProps {
  showShippingPolicy: boolean;
  showRefundPolicy: boolean;
}

const ProductDetailsAccordion = forwardRef<
  HTMLDivElement,
  ProductDetailsAccordionProps
>((props, ref) => {
  const { showShippingPolicy, showRefundPolicy, ...rest } = props;

  return (
    <div ref={ref} {...rest}>
      <ProductDetails
        showShippingPolicy={showShippingPolicy}
        showRefundPolicy={showRefundPolicy}
      />
    </div>
  );
});

export default ProductDetailsAccordion;

export const schema = createSchema({
  type: "mp--details-accordion",
  title: "Details accordion",
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
          label: "Show shipping policy",
          name: "showShippingPolicy",
          defaultValue: true,
        },
        {
          type: "switch",
          label: "Show refund policy",
          name: "showRefundPolicy",
          defaultValue: true,
        },
      ],
    },
  ],
});