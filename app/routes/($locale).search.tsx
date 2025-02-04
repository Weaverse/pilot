import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { Await, Form, useLoaderData } from "@remix-run/react";
import {
  Analytics,
  Pagination,
  getPaginationVariables,
  getSeoMeta,
} from "@shopify/hydrogen";
import type { LoaderFunctionArgs, MetaArgs } from "@shopify/remix-oxygen";
import { defer } from "@shopify/remix-oxygen";
import { clsx } from "clsx";
import { Fragment, Suspense, useEffect, useState } from "react";
import type { SearchQuery } from "storefront-api.generated";
import { BreadCrumb } from "~/components/breadcrumb";
import Link from "~/components/link";
import { ProductCard } from "~/components/product/product-card";
import { Section } from "~/components/section";
import { Swimlane } from "~/components/swimlane";
import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
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
  let { searchParams } = new URL(request.url);
  let searchTerm = searchParams.get("q");
  let products: SearchQuery["products"] = {
    nodes: [],
    pageInfo: null,
  };

  if (searchTerm) {
    let variables = getPaginationVariables(request, {
      pageBy: PAGINATION_SIZE,
    });

    let data = await storefront.query<SearchQuery>(SEARCH_QUERY, {
      variables: {
        searchTerm,
        ...variables,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    });
    products = data.products;
  }

  let hasResults = products?.nodes?.length > 0;

  return defer({
    seo: seoPayload.collection({
      url: request.url,
      collection: {
        id: "search",
        title: "Search",
        handle: "search",
        descriptionHtml: "Search results",
        description: "Search results",
        seo: {
          title: "Search",
          description: hasResults
            ? `Showing ${products.nodes.length} search results for "${searchTerm}"`
            : searchTerm
              ? `No results found for "${searchTerm}"`
              : "Search our store",
        },
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
  });
}

export let meta = ({ matches }: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

const POPULAR_SEARCHES = ["French Linen", "Shirt", "Cotton"];

export default function Search() {
  let { searchTerm, products, recommendations } =
    useLoaderData<typeof loader>();
  let [searchKey, setSearchKey] = useState(searchTerm);
  let hasResults = products?.nodes?.length > 0;

  useEffect(() => {
    setSearchKey(searchTerm);
  }, [searchTerm]);

  return (
    <Section width="fixed" verticalPadding="medium">
      <BreadCrumb className="justify-center" page="Search" />
      <h4 className="mt-4 mb-2.5 font-medium text-center">Search</h4>
      <div className="flex items-center justify-center text-body-subtle">
        <span>Popular Searches:</span>
        {POPULAR_SEARCHES.map((search, ind) => (
          <Fragment key={search}>
            <Link
              to={`/search?q=${search}`}
              className="ml-1 hover:underline underline-offset-4"
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
        className="flex items-center gap-3 w-[700px] max-w-[90vw] mx-auto mt-6 border border-line px-3"
      >
        <MagnifyingGlass className="w-5 h-5 shrink-0 text-gray-500" />
        <input
          className="focus-visible:outline-none w-full h-full py-4"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          name="q"
          placeholder="Search our store..."
          type="search"
        />
        <button
          type="button"
          className="shrink-0 text-gray-500 p-1"
          onClick={() => setSearchKey("")}
        >
          <X className="w-5 h-5" />
        </button>
      </Form>
      {hasResults ? (
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
              <div className="flex w-full flex-col gap-8 items-center pt-20">
                {hasPreviousPage && (
                  <Link
                    to={previousPageUrl}
                    variant="outline"
                    className="mx-auto"
                  >
                    {isLoading ? "Loading..." : "Previous"}
                  </Link>
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
                  <Link to={nextPageUrl} variant="outline" className="mx-auto">
                    {isLoading ? "Loading..." : "Next"}
                  </Link>
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
        <div className="flex text-lg flex-col items-center justify-center my-10">
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
            let { featuredProducts } = data;
            return (
              <div className="space-y-6 pt-20">
                <h5>Trending Products</h5>
                <Swimlane>
                  {featuredProducts.nodes.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      className="snap-start w-80"
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
