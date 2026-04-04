import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";

interface ProductHighlightsProps extends HydrogenComponentProps {
  ref: React.Ref<HTMLDivElement>;
}

export default function ProductHighlights(props: ProductHighlightsProps) {
  let { children, ...rest } = props;

  return (
    <div {...rest}>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

export let schema = createSchema({
  type: "mp--highlights",
  title: "Product highlights",
  childTypes: ["mp--highlight-item"],
  enabledOn: {
    pages: ["PRODUCT"],
  },
  presets: {
    children: [
      {
        type: "mp--highlight-item",
        icon: "package",
        text: "Free shipping on orders over $50",
      },
      {
        type: "mp--highlight-item",
        icon: "shield-check",
        text: "2-year warranty included",
      },
      {
        type: "mp--highlight-item",
        icon: "clock",
        text: "Easy returns within 30 days",
      },
      {
        type: "mp--highlight-item",
        icon: "leaf",
        text: "Made with sustainable materials",
      },
    ],
  },
});
