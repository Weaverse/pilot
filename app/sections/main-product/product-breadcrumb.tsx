import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import { Link } from "~/components/link";
import type { loader as productRouteLoader } from "~/routes/products/product";

interface ProductBreadcrumbProps extends HydrogenComponentProps {
  ref: React.Ref<HTMLDivElement>;
  homeText: string;
  excludeCollections: string;
}

export default function ProductBreadcrumb(props: ProductBreadcrumbProps) {
  const { homeText, excludeCollections, ...rest } = props;
  const { product } = useLoaderData<typeof productRouteLoader>();

  if (!product) {
    return null;
  }

  let excludeHandles = excludeCollections
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  let collection = product.collections?.nodes?.find(
    (col) => !excludeHandles.includes(col.handle.toLowerCase()),
  );

  return (
    <div {...rest} className="flex items-center gap-1.5">
      <Link
        to="/"
        className="text-body-subtle underline-offset-4 hover:underline"
      >
        {homeText}
      </Link>
      {collection && (
        <>
          <span className="text-body-subtle">/</span>
          <Link
            to={`/collections/${collection.handle}`}
            className="text-body-subtle underline-offset-4 hover:underline"
          >
            {collection.title}
          </Link>
        </>
      )}
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
        {
          type: "text",
          label: "Exclude collections",
          name: "excludeCollections",
          defaultValue: "all, frontpage",
          placeholder: "all, frontpage",
          helpText:
            "Comma-separated list of collection handles to exclude from the breadcrumb.",
        },
      ],
    },
  ],
});
