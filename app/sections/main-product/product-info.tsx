import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";

interface ProductInfoProps extends HydrogenComponentProps {}

export default function ProductInfo(props: ProductInfoProps) {
  const { children, ...rest } = props;

  return (
    <div {...rest}>
      <div
        className="sticky flex flex-col justify-start gap-5"
        style={{ top: "calc(var(--height-nav) + 20px)" }}
      >
        {children}
      </div>
    </div>
  );
}

export const schema = createSchema({
  type: "mp--info",
  title: "Product Info",
  limit: 1,
  childTypes: [
    "mp--breadcrumb",
    "mp--promo-text",
    "mp--availability",
    "mp--vendor",
    "mp--title",
    "mp--prices",
    "judgeme-stars-rating",
    "mp--summary",
    "mp--bundled-variants",
    "mp--variant-selector",
    "mp--quantity-selector",
    "mp--atc-buttons",
    "mp--estimated-delivery",
    "mp--highlights",
    "mp--collapsible-details",
  ],
  enabledOn: {
    pages: ["PRODUCT"],
  },
  presets: {
    children: [
      { type: "mp--vendor" },
      { type: "mp--title" },
      { type: "mp--prices" },
      { type: "judgeme-stars-rating" },
      { type: "mp--summary" },
      { type: "mp--promo-text" },
      { type: "mp--availability" },
      { type: "mp--bundled-variants" },
      { type: "mp--variant-selector" },
      { type: "mp--quantity-selector" },
      { type: "mp--atc-buttons" },
      { type: "mp--estimated-delivery" },
      { type: "mp--highlights" },
      { type: "mp--collapsible-details" },
    ],
  },
});
