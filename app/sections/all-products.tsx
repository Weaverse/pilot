import { Pagination } from "@shopify/hydrogen";
import { createSchema } from "@weaverse/hydrogen";
import clsx from "clsx";
import { forwardRef } from "react";
import { useLoaderData } from "react-router";
import type { AllProductsQuery } from "storefront-api.generated";
import { BreadCrumb } from "~/components/breadcrumb";
import Link from "~/components/link";
import { ProductCard } from "~/components/product/product-card";
import { layoutInputs, Section, type SectionProps } from "~/components/section";

interface AllProductsProps extends SectionProps {
  heading: string;
  prevPageText: string;
  nextPageText: string;
}

const AllProducts = forwardRef<HTMLElement, AllProductsProps>((props, ref) => {
  const { heading, prevPageText, nextPageText, ...rest } = props;
  const { products } = useLoaderData<AllProductsQuery>();

  return (
    <Section ref={ref} {...rest} overflow="unset">
      <BreadCrumb page={heading} className="mb-4 justify-center" />
      <h4 className="mb-8 text-center font-medium lg:mb-20">{heading}</h4>
      <Pagination connection={products}>
        {({
          nodes,
          isLoading,
          nextPageUrl,
          hasNextPage,
          previousPageUrl,
          hasPreviousPage,
        }) => {
          return (
            <div className="flex w-full flex-col items-center gap-8">
              {hasPreviousPage && (
                <Link
                  to={previousPageUrl}
                  variant="outline"
                  className="mx-auto"
                >
                  {isLoading ? "Loading..." : prevPageText}
                </Link>
              )}
              <div
                className={clsx([
                  "w-full gap-x-4 gap-y-6 lg:gap-y-10",
                  "grid grid-cols-1 lg:grid-cols-4",
                ])}
              >
                {nodes.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {hasNextPage && (
                <Link to={nextPageUrl} variant="outline" className="mx-auto">
                  {isLoading ? "Loading..." : nextPageText}
                </Link>
              )}
            </div>
          );
        }}
      </Pagination>
    </Section>
  );
});

export default AllProducts;

export const schema = createSchema({
  type: "all-products",
  title: "All products",
  limit: 1,
  enabledOn: {
    pages: ["ALL_PRODUCTS"],
  },
  settings: [
    {
      group: "Layout",
      inputs: [
        ...layoutInputs.filter(
          (inp) =>
            inp.name !== "divider" &&
            inp.name !== "borderRadius" &&
            inp.name !== "gap",
        ),
      ],
    },
    {
      group: "All products",
      inputs: [
        {
          type: "text",
          name: "heading",
          label: "Heading",
          defaultValue: "All Products",
          placeholder: "All Products",
        },
        {
          type: "text",
          name: "prevPageText",
          label: "Previous page text",
          defaultValue: "Previous",
          placeholder: "Previous",
        },
        {
          type: "text",
          name: "nextPageText",
          label: "Next page text",
          defaultValue: "Next",
          placeholder: "Next",
        },
      ],
    },
  ],
});
