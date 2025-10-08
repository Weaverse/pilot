import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import { Link } from "~/components/link";
import type { loader as productRouteLoader } from "~/routes/products/product";

interface ProductBreadcrumbProps extends HydrogenComponentProps {
  ref: React.Ref<HTMLDivElement>;
  homeText: string;
}

export default function ProductBreadcrumb(props: ProductBreadcrumbProps) {
  const { ref, homeText, ...rest } = props;
  const { product } = useLoaderData<typeof productRouteLoader>();

  if (!product) {
    return null;
  }

  return (
    <div ref={ref} {...rest} className="flex items-center gap-1.5">
      <Link
        to="/"
        className="text-body-subtle underline-offset-4 hover:underline"
      >
        {homeText}
      </Link>
      <span className="inline-block h-4 border-body-subtle border-r" />
      <span>{product.title}</span>
    </div>
  );
}

export const schema = createSchema({
  type: "mp--breadcrumb",
  title: "Breadcrumb",
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
          label: "Home text",
          name: "homeText",
          defaultValue: "Home",
          placeholder: "Home",
        },
      ],
    },
  ],
});
