import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import {
  Analytics,
  getPaginationVariables,
  getSeoMeta,
  Pagination,
} from "@shopify/hydrogen";
import type { LoaderFunctionArgs, MetaArgs } from "@shopify/remix-oxygen";
import { clsx } from "clsx";
import { Fragment, Suspense, useEffect, useState } from "react";
import { Await, Form, useLoaderData } from "react-router";
import type { SearchQuery } from "storefront-api.generated";
import { BreadCrumb } from "~/components/breadcrumb";
import Link, { variants } from "~/components/link";
import { ProductCard } from "~/components/product/product-card";
import { Section } from "~/components/section";
import { Swimlane } from "~/components/swimlane";
import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
import { cn } from "~/utils/cn";
import { PAGINATION_SIZE } from "~/utils/const";
import { seoPayload } from "~/utils/seo.server";
import {
  type FeaturedData,
  getFeaturedData,
} from "./($locale).api.featured-items";

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
    const variables = getPaginationVariables(request, {
      pageBy: PAGINATION_SIZE,
    });

    const data = await storefront.query<SearchQuery>(SEARCH_QUERY, {
      variables: {
        searchTerm,
        ...variables,
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
        descriptionHtml: "Search results",
        description: "Search results",
        seo: { title: "Search", description: seoDescription },
        metafields: [],
        products,
        updatedAt: new Date().toISOString(),
      },
    }),
    searchTerm,
    products,
    recommendations: hasResults
      ? Promise.resolve(null)
      : getRecommendations(storefront),
  };
}

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
  return getSeoMeta(
    ...matches.map((match) => (match.data as any)?.seo).filter(Boolean),
  );
};

const POPULAR_SEARCHES = ["French Linen", "Shirt", "Cotton"];

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
      <div className="flex items-center justify-center text-body-subtle">
        <span>Popular Searches:</span>
        {POPULAR_SEARCHES.map((search, ind) => (
          <Fragment key={search}>
            <Link
              to={`/search?q=${search}`}
              className="ml-1 underline-offset-4 hover:underline"
            >
              {search}
            </Link>
            {ind < POPULAR_SEARCHES.length - 1 && (
              <span className="mr-px">,</span>
            )}
          </Fragment>
        ))}
      </div>
      <Form
        method="get"
        className="mx-auto mt-6 flex w-[700px] max-w-[90vw] items-center gap-3 border border-line px-3"
      >
        <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-gray-500" />
        <input
          className="h-full w-full py-4 focus-visible:outline-hidden"
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
                    "w-full gap-x-1.5 gap-y-8 lg:gap-y-10",
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

function NoResults({
  searchTerm,
  recommendations,
}: {
  searchTerm: string;
  recommendations: Promise<null | FeaturedData>;
}) {
  return (
    <>
      {searchTerm && (
        <div className="my-10 flex flex-col items-center justify-center text-lg">
          No results for "{searchTerm}", try a different search.
        </div>
      )}
      <Suspense>
        <Await
          errorElement="There was a problem loading related products"
          resolve={recommendations}
        >
          {(data) => {
            if (!data) {
              return null;
            }
            const { featuredProducts } = data;
            return (
              <div className="space-y-6 pt-20">
                <h5>Trending Products</h5>
                <Swimlane>
                  {featuredProducts.nodes.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      className="w-80 snap-start"
                    />
                  ))}
                </Swimlane>
              </div>
            );
          }}
        </Await>
      </Suspense>
    </>
  );
}

function getRecommendations(
  storefront: LoaderFunctionArgs["context"]["storefront"],
) {
  return getFeaturedData(storefront, { pageBy: PAGINATION_SIZE });
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
