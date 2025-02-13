import { useLoaderData } from "@remix-run/react";
import { Pagination } from "@shopify/hydrogen";
import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import clsx from "clsx";
import { forwardRef } from "react";
import type { AllProductsQuery } from "storefront-api.generated";
import { BreadCrumb } from "~/components/breadcrumb";
import Link from "~/components/link";
import { ProductCard } from "~/components/product/product-card";
import { Section, type SectionProps, layoutInputs } from "~/components/section";

interface AllProductsProps extends SectionProps {
  heading: string;
  prevPageText: string;
  nextPageText: string;
}

let AllProducts = forwardRef<HTMLElement, AllProductsProps>((props, ref) => {
  let { heading, prevPageText, nextPageText, ...rest } = props;
  let { products } = useLoaderData<AllProductsQuery>();

  return (
    <Section ref={ref} {...rest} overflow="unset">
      <BreadCrumb page={heading} className="justify-center mb-4" />
      <h4 className="mb-8 lg:mb-20 font-medium text-center">{heading}</h4>
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
            <div className="flex w-full flex-col gap-8 items-center">
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

export let schema: HydrogenComponentSchema = {
  type: "all-products",
  title: "All products",
  limit: 1,
  enabledOn: {
    pages: ["ALL_PRODUCTS"],
  },
  inspector: [
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
};
