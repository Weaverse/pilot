import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import {
  Analytics,
  getPaginationVariables,
  getSeoMeta,
  Pagination,
} from "@shopify/hydrogen";
import { useEffect, useRef, useState } from "react";
import type { LoaderFunctionArgs, MetaArgs } from "react-router";
import { data, Form, useLoaderData } from "react-router";
import type { SearchPageQuery } from "storefront-api.generated";
import { seoPayload } from "~/.server/seo";
import { BreadCrumb } from "~/components/breadcrumb";
import { ProductsLoadedOnScroll } from "~/components/product-grid/products-loaded-on-scroll";
import { Section } from "~/components/section";
import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
import { getFeaturedProducts } from "~/utils/featured-products";
import { ArticlesGrid } from "./articles-grid";
import { CollectionsGrid } from "./collections-grid";
import { NoResults } from "./no-results";
import { PagesList } from "./pages-list";
import { PopularKeywords } from "./popular-searches";
import { SearchTabs } from "./search-tabs";
import { TabNoResults } from "./tab-no-results";
import type { SearchCounts, SearchType } from "./types";

export async function loader({
  request,
  context: { storefront },
}: LoaderFunctionArgs) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get("q") || "";
  const activeTab = (searchParams.get("type") as SearchType) || "products";

  let products: SearchPageQuery["products"] = {
    nodes: [],
    pageInfo: null,
  };
  let articles: SearchPageQuery["articles"] = { nodes: [] };
  let pages: SearchPageQuery["pages"] = { nodes: [] };
  let collections: SearchPageQuery["collections"] = { nodes: [] };

  if (searchTerm) {
    const searchData = await storefront.query<SearchPageQuery>(
      SEARCH_PAGE_QUERY,
      {
        variables: {
          searchTerm: `title:*${searchTerm}*`,
          ...getPaginationVariables(request, { pageBy: 16 }),
          country: storefront.i18n.country,
          language: storefront.i18n.language,
        },
      },
    );

    products = searchData.products;
    articles = searchData.articles;
    pages = searchData.pages;
    collections = searchData.collections;
  }

  const counts: SearchCounts = {
    products: products?.nodes?.length || 0,
    articles: articles?.nodes?.length || 0,
    pages: pages?.nodes?.length || 0,
    collections: collections?.nodes?.length || 0,
  };

  const totalResults =
    counts.products + counts.articles + counts.pages + counts.collections;
  const hasResults = totalResults > 0;

  let seoDescription = "";
  if (hasResults) {
    seoDescription = `Showing ${totalResults} search results for "${searchTerm}"`;
  } else if (searchTerm) {
    seoDescription = `No results found for "${searchTerm}"`;
  } else {
    seoDescription = "Search our store";
  }

  return data({
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
    activeTab,
    products,
    articles: articles?.nodes || [],
    pages: pages?.nodes || [],
    collections: collections?.nodes || [],
    counts,
    recommendations: hasResults
      ? Promise.resolve(null)
      : getFeaturedProducts(storefront),
  });
}

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
  return getSeoMeta(
    ...matches.map((match) => (match.data as any)?.seo).filter(Boolean),
  );
};

export default function Search() {
  const {
    searchTerm,
    activeTab,
    products,
    articles,
    pages,
    collections,
    counts,
    recommendations,
  } = useLoaderData<typeof loader>();
  const [searchKey, setSearchKey] = useState(searchTerm);

  useEffect(() => {
    setSearchKey(searchTerm);
  }, [searchTerm]);

  const totalResults =
    counts.products + counts.articles + counts.pages + counts.collections;
  const hasAnyResults = totalResults > 0;

  function ProductsTab() {
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setInView(entry.isIntersecting);
        },
        { threshold: 0 },
      );

      if (loadMoreRef.current) {
        observer.observe(loadMoreRef.current);
      }

      return () => observer.disconnect();
    }, []);

    if (counts.products === 0) {
      return <TabNoResults type="products" searchTerm={searchTerm} />;
    }

    return (
      <Pagination connection={products}>
        {({ nodes, state, hasNextPage, nextPageUrl }) => (
          <>
            <ProductsLoadedOnScroll
              nodes={nodes}
              inView={inView}
              nextPageUrl={nextPageUrl}
              hasNextPage={hasNextPage}
              state={state}
              minCardWidth={280}
              gapX={16}
              gapY={24}
            />
            <div ref={loadMoreRef} className="h-4" />
          </>
        )}
      </Pagination>
    );
  }

  function renderTabContent() {
    switch (activeTab) {
      case "products":
        return <ProductsTab />;

      case "articles":
        if (counts.articles === 0) {
          return <TabNoResults type="articles" searchTerm={searchTerm} />;
        }
        return <ArticlesGrid articles={articles} />;

      case "pages":
        if (counts.pages === 0) {
          return <TabNoResults type="pages" searchTerm={searchTerm} />;
        }
        return <PagesList pages={pages} />;

      case "collections":
        if (counts.collections === 0) {
          return <TabNoResults type="collections" searchTerm={searchTerm} />;
        }
        return <CollectionsGrid collections={collections} />;

      default:
        return null;
    }
  }

  return (
    <Section width="fixed" verticalPadding="medium">
      <BreadCrumb className="justify-center" page="Search" />
      <h4 className="mt-4 mb-2.5 text-center font-medium">Search</h4>
      <Form
        method="get"
        className="mx-auto mt-6 mb-4 flex w-175 max-w-[90vw] items-center gap-3 border border-line px-3"
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
        <input type="hidden" name="type" value={activeTab} />
        <button
          type="button"
          className="shrink-0 p-1 text-gray-500"
          onClick={() => setSearchKey("")}
        >
          <XIcon className="h-5 w-5" />
        </button>
      </Form>
      <PopularKeywords />

      {hasAnyResults ? (
        <div className="mt-8 space-y-8">
          <SearchTabs counts={counts} />
          <div className="min-h-100">{renderTabContent()}</div>
        </div>
      ) : (
        <NoResults searchTerm={searchTerm} recommendations={recommendations} />
      )}

      <Analytics.SearchView
        data={{ searchTerm: searchTerm || "", searchResults: products }}
      />
    </Section>
  );
}

const SEARCH_PAGE_QUERY = `#graphql
  query searchPage(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $searchTerm: String
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
      sortKey: RELEVANCE
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

    articles(first: 20, query: $searchTerm, sortKey: RELEVANCE) {
      nodes {
        id
        title
        handle
        image {
          url
          altText
          width
          height
        }
        publishedAt
        excerpt
        blog {
          handle
          title
        }
      }
    }

    pages(first: 20, query: $searchTerm, sortKey: RELEVANCE) {
      nodes {
        id
        title
        handle
      }
    }

    collections(first: 20, query: $searchTerm, sortKey: RELEVANCE) {
      nodes {
        id
        title
        handle
        image {
          url
          altText
          width
          height
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
