import { Await, Form, useLoaderData } from "@remix-run/react";
import {
  Analytics,
  Pagination,
  getPaginationVariables,
  getSeoMeta,
} from "@shopify/hydrogen";
import type { LoaderFunctionArgs, MetaArgs } from "@shopify/remix-oxygen";
import { defer } from "@shopify/remix-oxygen";
import { Suspense } from "react";
import { PRODUCT_CARD_FRAGMENT } from "~/data/fragments";
import { PAGINATION_SIZE, getImageLoadingPriority } from "~/lib/const";
import { seoPayload } from "~/lib/seo.server";
import { Heading, PageHeader, Section, Text } from "~/modules/text";
import { Grid } from "~/modules/grid";
import { Input } from "~/modules/input";
import { ProductCard } from "~/modules/product-card";
import { ProductSwimlane } from "~/modules/product-swimlane";
import {
  type FeaturedData,
  getFeaturedData,
} from "./($locale).api.featured-items";

export async function loader({
  request,
  context: { storefront },
}: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const searchTerm = searchParams.get("q");
  const variables = getPaginationVariables(request, {
    pageBy: PAGINATION_SIZE,
  });

  const { products } = await storefront.query(SEARCH_QUERY, {
    variables: {
      searchTerm,
      ...variables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  const shouldGetRecommendations = !searchTerm || products?.nodes?.length === 0;

  const seo = seoPayload.collection({
    url: request.url,
    collection: {
      id: "search",
      title: "Search",
      handle: "search",
      descriptionHtml: "Search results",
      description: "Search results",
      seo: {
        title: "Search",
        description: `Showing ${products.nodes.length} search results for "${searchTerm}"`,
      },
      metafields: [],
      products,
      updatedAt: new Date().toISOString(),
    },
  });

  return defer({
    seo,
    searchTerm,
    products,
    noResultRecommendations: shouldGetRecommendations
      ? getNoResultRecommendations(storefront)
      : Promise.resolve(null),
  });
}

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Search() {
  const { searchTerm, products, noResultRecommendations } =
    useLoaderData<typeof loader>();
  const noResults = products?.nodes?.length === 0;

  return (
    <>
      <PageHeader>
        <Heading as="h1" size="copy">
          Search
        </Heading>
        <Form method="get" className="relative flex w-full text-heading">
          <Input
            defaultValue={searchTerm || ""}
            name="q"
            placeholder="Search…"
            type="search"
            variant="search"
          />
          <button className="absolute right-0 py-2" type="submit">
            Go
          </button>
        </Form>
      </PageHeader>
      {!searchTerm || noResults ? (
        <NoResults
          noResults={noResults}
          recommendations={noResultRecommendations}
        />
      ) : (
        <Section>
          <Pagination connection={products}>
            {({ nodes, isLoading, NextLink, PreviousLink }) => {
              const itemsMarkup = nodes.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  loading={getImageLoadingPriority(i)}
                />
              ));

              return (
                <>
                  <div className="flex items-center justify-center mt-6">
                    <PreviousLink className="inline-block rounded font-medium text-center py-3 px-6 bg-foreground text-body w-full">
                      {isLoading ? "Loading..." : "Previous"}
                    </PreviousLink>
                  </div>
                  <Grid data-test="product-grid">{itemsMarkup}</Grid>
                  <div className="flex items-center justify-center mt-6">
                    <NextLink className="inline-block rounded font-medium text-center py-3 px-6 bg-foreground text-body w-full">
                      {isLoading ? "Loading..." : "Next"}
                    </NextLink>
                  </div>
                </>
              );
            }}
          </Pagination>
        </Section>
      )}
      <Analytics.SearchView
        data={{ searchTerm: searchTerm || "", searchResults: products }}
      />
    </>
  );
}

function NoResults({
  noResults,
  recommendations,
}: {
  noResults: boolean;
  recommendations: Promise<null | FeaturedData>;
}) {
  return (
    <>
      {noResults && (
        <Section padding="x">
          <Text className="opacity-50">
            No results, try a different search.
          </Text>
        </Section>
      )}
      <Suspense>
        <Await
          errorElement="There was a problem loading related products"
          resolve={recommendations}
        >
          {(result) => {
            if (!result) return null;
            const { featuredProducts } = result;

            return (
              <>
                <ProductSwimlane
                  title="Trending Products"
                  products={featuredProducts}
                />
              </>
            );
          }}
        </Await>
      </Suspense>
    </>
  );
}

export function getNoResultRecommendations(
  storefront: LoaderFunctionArgs["context"]["storefront"]
) {
  return getFeaturedData(storefront, { pageBy: PAGINATION_SIZE });
}

const SEARCH_QUERY = `#graphql
  query PaginatedProductsSearch(
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
