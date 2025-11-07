import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import {
  Analytics,
  getPaginationVariables,
  getSeoMeta,
  Pagination,
} from "@shopify/hydrogen";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import type { LoaderFunctionArgs, MetaArgs } from "react-router";
import { Form, useLoaderData } from "react-router";
import type { SearchQuery } from "storefront-api.generated";
import { seoPayload } from "~/.server/seo";
import { BreadCrumb } from "~/components/breadcrumb";
import { variants } from "~/components/link";
import { ProductCard } from "~/components/product/product-card";
import { Section } from "~/components/section";
import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
import { cn } from "~/utils/cn";
import { getFeaturedProducts } from "~/utils/featured-products";
import { NoResults } from "./no-results";
import { PopularKeywords } from "./popular-searches";

export async function loader({
  request,
  context: { storefront },
}: LoaderFunctionArgs) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get("q");
  let products: SearchQuery["products"] = {
    nodes: [],
    pageInfo: null,
  };

  if (searchTerm) {
    const data = await storefront.query<SearchQuery>(SEARCH_QUERY, {
      variables: {
        searchTerm,
        ...getPaginationVariables(request, { pageBy: 16 }),
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    });
    products = data.products;
  }

  const hasResults = products?.nodes?.length > 0;
  let seoDescription = "";
  if (hasResults) {
    seoDescription = `Showing ${products.nodes.length} search results for "${searchTerm}"`;
  } else if (searchTerm) {
    seoDescription = `No results found for "${searchTerm}"`;
  } else {
    seoDescription = "Search our store";
  }

  return {
    seo: seoPayload.collection({
      url: request.url,
      collection: {
        id: "search",
        title: "Search",
        handle: "search",
        description: "Search results",
        seo: { title: "Search", description: seoDescription },
        products,
      },
    }),
    searchTerm,
    products,
    recommendations: hasResults
      ? Promise.resolve(null)
      : getFeaturedProducts(storefront),
  };
}

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
  return getSeoMeta(
    ...matches.map((match) => (match.data as any)?.seo).filter(Boolean),
  );
};

export default function Search() {
  const { searchTerm, products, recommendations } =
    useLoaderData<typeof loader>();
  const [searchKey, setSearchKey] = useState(searchTerm);
  const hasResults = products?.nodes?.length > 0;

  useEffect(() => {
    setSearchKey(searchTerm);
  }, [searchTerm]);

  return (
    <Section width="fixed" verticalPadding="medium">
      <BreadCrumb className="justify-center" page="Search" />
      <h4 className="mt-4 mb-2.5 text-center font-medium">Search</h4>
      <Form
        method="get"
        className="mx-auto mt-6 mb-4 flex w-[700px] max-w-[90vw] items-center gap-3 border border-line px-3"
      >
        <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-gray-500" />
        <input
          className="h-full w-full border-none py-4 focus:outline-hidden focus:ring-0 focus-visible:outline-hidden"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          name="q"
          placeholder="Search our store..."
          type="search"
        />
        <button
          type="button"
          className="shrink-0 p-1 text-gray-500"
          onClick={() => setSearchKey("")}
        >
          <XIcon className="h-5 w-5" />
        </button>
      </Form>
      <PopularKeywords />
      {hasResults ? (
        <Pagination connection={products}>
          {({
            nodes,
            isLoading,
            hasNextPage,
            hasPreviousPage,
            NextLink,
            PreviousLink,
          }) => {
            return (
              <div className="flex w-full flex-col items-center gap-8 pt-20">
                {hasPreviousPage && (
                  <PreviousLink
                    className={cn("mx-auto", variants({ variant: "outline" }))}
                  >
                    {isLoading ? "Loading..." : "↑ Load previous"}
                  </PreviousLink>
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
                  <NextLink
                    className={cn("mx-auto", variants({ variant: "outline" }))}
                  >
                    {isLoading ? "Loading..." : "↓ Load more"}
                  </NextLink>
                )}
              </div>
            );
          }}
        </Pagination>
      ) : (
        <NoResults searchTerm={searchTerm} recommendations={recommendations} />
      )}
      <Analytics.SearchView
        data={{ searchTerm: searchTerm || "", searchResults: products }}
      />
    </Section>
  );
}

const SEARCH_QUERY = `#graphql
  query search(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $searchTerm: String
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor,
      sortKey: RELEVANCE,
      query: $searchTerm
    ) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
