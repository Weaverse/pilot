import { createSchema } from "@weaverse/hydrogen";
import { layoutInputs, Section, type SectionProps } from "~/components/section";

interface RelatedProductsProps extends SectionProps {
  ref: React.Ref<HTMLElement>;
}

export default function RelatedProducts(props: RelatedProductsProps) {
  let { ref, children, ...rest } = props;
  return (
    <Section ref={ref} {...rest}>
      {children}
    </Section>
  );
}

export const schema = createSchema({
  type: "related-products",
  title: "Related products",
  limit: 1,
  childTypes: ["subheading", "heading", "paragraph", "related-products--items"],
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [
    {
      group: "Layout",
      inputs: layoutInputs.filter((i) => i.name !== "borderRadius"),
    },
  ],
  presets: {
    gap: 22,
    verticalPadding: "small",
    children: [
      {
        type: "heading",
        content: "You may also like",
        as: "h4",
        alignment: "left",
      },
      {
        type: "related-products--items",
      },
    ],
  },
});
