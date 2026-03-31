import { createSchema } from "@weaverse/hydrogen";
import clsx from "clsx";
import { useLoaderData } from "react-router";
import { layoutInputs, Section, type SectionProps } from "~/components/section";
import type { loader as productRouteLoader } from "~/routes/products/product";

interface MainProductProps extends SectionProps {
  ref: React.Ref<HTMLDivElement>;
}

export default function MainProduct(props: MainProductProps) {
  const { children, ...rest } = props;
  const { product } = useLoaderData<typeof productRouteLoader>();

  if (product) {
    return (
      <Section {...rest} overflow="unset" animate={false}>
        <div
          className={clsx([
            "@container/main-product",
            "space-y-5 lg:grid lg:space-y-0",
            "lg:gap-[clamp(30px,5%,60px)]",
            "lg:grid-cols-[1fr_clamp(360px,45%,480px)]",
          ])}
        >
          {children}
        </div>
      </Section>
    );
  }
  return (
    <div {...rest}>
      No product data...
    </div>
  );
}

export const schema = createSchema({
  type: "main-product",
  title: "Main product",
  childTypes: ["mp--media", "mp--info"],
  limit: 1,
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [{ group: "Layout", inputs: layoutInputs }],
  presets: {
    children: [
      {
        type: "mp--media",
      },
      {
        type: "mp--info",
      },
    ],
  },
});
