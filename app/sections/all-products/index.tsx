import { createSchema } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import type { AllProductsQuery } from "storefront-api.generated";
import { layoutInputs, Section, type SectionProps } from "~/components/section";

interface AllProductsProps extends SectionProps {
  ref: React.Ref<HTMLElement>;
}

export default function AllProducts(props: AllProductsProps) {
  const { ref, children, ...rest } = props;
  const { products } = useLoaderData<AllProductsQuery>();

  if (products) {
    return (
      <Section ref={ref} {...rest} overflow="unset" animate={false}>
        {children}
      </Section>
    );
  }
  return <Section ref={ref} {...rest} />;
}

export const schema = createSchema({
  type: "all-products",
  title: "All products",
  limit: 1,
  enabledOn: {
    pages: ["ALL_PRODUCTS"],
  },
  childTypes: ["ap--toolbar", "ap--product-grid"],
  settings: [
    {
      group: "Layout",
      inputs: layoutInputs.filter(
        (inp) =>
          inp.name !== "divider" &&
          inp.name !== "borderRadius" &&
          inp.name !== "gap",
      ),
    },
  ],
  presets: {
    children: [{ type: "ap--toolbar" }, { type: "ap--product-grid" }],
  },
});
