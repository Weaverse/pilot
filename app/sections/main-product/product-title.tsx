import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import type { loader as productRouteLoader } from "~/routes/products/product";

interface ProductTitleProps extends HydrogenComponentProps {
  ref: React.Ref<HTMLDivElement>;
  headingTag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export default function ProductTitle(props: ProductTitleProps) {
  const { ref, headingTag: Tag, ...rest } = props;
  const { product } = useLoaderData<typeof productRouteLoader>();

  if (!product) {
    return null;
  }

  return (
    <div ref={ref} {...rest}>
      <Tag className="h3 tracking-tight!">{product.title}</Tag>
    </div>
  );
}

export const schema = createSchema({
  type: "mp--title",
  title: "Title",
  limit: 1,
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [
    {
      group: "General",
      inputs: [
        {
          type: "select",
          label: "Heading tag",
          name: "headingTag",
          defaultValue: "h1",
          configs: {
            options: [
              { value: "h1", label: "H1" },
              { value: "h2", label: "H2" },
              { value: "h3", label: "H3" },
              { value: "h4", label: "H4" },
              { value: "h5", label: "H5" },
              { value: "h6", label: "H6" },
            ],
          },
        },
      ],
    },
  ],
});
