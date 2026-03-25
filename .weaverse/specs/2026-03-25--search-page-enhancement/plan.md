# Implementation Plan: Enhanced Search Page

## Files to Modify

| File | Changes |
|------|---------|
| `app/routes/search/index.tsx` | Complete rewrite - new search query, tab interface, infinite scroll for products |
| `app/routes/search/types.ts` | Create new types for search results |
| `app/routes/search/search-tabs.tsx` | Create new tab component with result counts |

## Implementation Steps

### 1. Create Search Types (`app/routes/search/types.ts`)

```typescript
import type { ProductCardFragment } from "storefront-api.generated";

export type SearchType = "products" | "articles" | "pages" | "collections";

export interface ArticleSearchResult {
  id: string;
  title: string;
  handle: string;
  image?: {
    url: string;
    altText?: string;
  };
  publishedAt: string;
  excerpt?: string;
  blog: {
    handle: string;
    title: string;
  };
}

export interface PageSearchResult {
  id: string;
  title: string;
  handle: string;
}

export interface CollectionSearchResult {
  id: string;
  title: string;
  handle: string;
  image?: {
    url: string;
    altText?: string;
  };
}

export interface SearchResults {
  products: {
    nodes: ProductCardFragment[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
  };
  articles: ArticleSearchResult[];
  pages: PageSearchResult[];
  collections: CollectionSearchResult[];
}
```

### 2. Update Search Query

Replace products-only query with multi-type search:

```graphql
query searchPage(
  $country: CountryCode
  $language: LanguageCode
  $searchTerm: String!
  $first: Int
  $after: String
) @inContext(country: $country, language: $language) {
  # Products with pagination
  products(
    first: $first
    after: $after
    query: $searchTerm
    sortKey: RELEVANCE
  ) {
    nodes {
      ...ProductCard
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
  
  # Articles (no pagination - usually fewer results)
  articles(
    first: 20
    query: $searchTerm
  ) {
    nodes {
      id
      title
      handle
      image {
        url
        altText
      }
      publishedAt
      excerpt
      blog {
        handle
        title
      }
    }
  }
  
  # Pages
  pages(
    first: 20
    query: $searchTerm
  ) {
    nodes {
      id
      title
      handle
    }
  }
  
  # Collections
  collections(
    first: 20
    query: $searchTerm
  ) {
    nodes {
      id
      title
      handle
      image {
        url
        altText
      }
    }
  }
}
${PRODUCT_CARD_FRAGMENT}
```

### 3. Create Search Tabs Component (`app/routes/search/search-tabs.tsx`)

```typescript
import { Link } from "react-router";
import { cn } from "~/utils/cn";
import type { SearchType } from "./types";

interface SearchTabsProps {
  activeTab: SearchType;
  counts: {
    products: number;
    articles: number;
    pages: number;
    collections: number;
  };
  searchTerm: string;
}

const tabs: { type: SearchType; label: string }[] = [
  { type: "products", label: "Products" },
  { type: "articles", label: "Articles" },
  { type: "pages", label: "Pages" },
  { type: "collections", label: "Collections" },
];

export function SearchTabs({ activeTab, counts, searchTerm }: SearchTabsProps) {
  return (
    <div className="border-b border-line">
      <div className="flex gap-6">
        {tabs.map(({ type, label }) => (
          <Link
            key={type}
            to={`/search?q=${encodeURIComponent(searchTerm)}&type=${type}`}
            className={cn(
              "relative py-3 text-sm font-medium transition-colors",
              activeTab === type
                ? "text-foreground"
                : "text-body-subtle hover:text-foreground"
            )}
          >
            {label} ({counts[type]})
            {activeTab === type && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### 4. Update Search Route (`app/routes/search/index.tsx`)

**Loader Changes:**

```typescript
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get("q") || "";
  const activeTab = (searchParams.get("type") as SearchType) || "products";
  
  // Build query based on active tab to optimize data fetching
  // Products need pagination, others don't
  const variables: Record<string, any> = {
    searchTerm,
    country: context.storefront.i18n.country,
    language: context.storefront.i18n.language,
  };
  
  // Add pagination only for products
  if (activeTab === "products") {
    Object.assign(variables, getPaginationVariables(request, { pageBy: 16 }));
  }
  
  const data = await context.storefront.query<SearchPageQuery>(SEARCH_PAGE_QUERY, {
    variables,
  });
  
  return {
    searchTerm,
    activeTab,
    products: data.products,
    articles: data.articles?.nodes || [],
    pages: data.pages?.nodes || [],
    collections: data.collections?.nodes || [],
  };
}
```

**Component Changes:**

- Read `activeTab` from loader data
- Render `SearchTabs` with result counts
- For products tab: Use `ProductsLoadedOnScroll` component
- For other tabs: Render simple grid/list
- Show "No results" message when tab count is 0

**Products Tab with Infinite Scroll:**

```typescript
// In Search component
const { searchTerm, activeTab, products, articles, pages, collections } = useLoaderData<typeof loader>();

const counts = {
  products: products?.nodes?.length || 0,
  articles: articles?.length || 0,
  pages: pages?.length || 0,
  collections: collections?.length || 0,
};

// ... render tabs

{activeTab === "products" && (
  <Pagination connection={products}>
    {({ nodes, ...paginationProps }) => (
      <ProductsLoadedOnScroll
        nodes={nodes}
        minCardWidth={280}
        gapX={16}
        gapY={24}
        {...paginationProps}
      />
    )}
  </Pagination>
)}

{activeTab === "articles" && (
  articles.length > 0 ? (
    <ArticlesGrid articles={articles} />
  ) : (
    <NoResults type="articles" searchTerm={searchTerm} />
  )
)}

// Similar for pages and collections
```

### 5. Create Result Components

**Articles Grid:**
- Show article image, title, excerpt, publish date
- Link to `/blogs/{blog.handle}/{article.handle}`

**Pages List:**
- Simple list of page titles
- Link to `/pages/{handle}`

**Collections Grid:**
- Show collection image and title
- Link to `/collections/{handle}`

**NoResults Component:**
- Show friendly message like "No {type} found for \"{searchTerm}\""
- Suggest checking spelling or trying different keywords

## Data Flow

```
User Search → URL (?q=term&type=products)
    ↓
Loader reads type param (default: products)
    ↓
GraphQL query with search term
    ↓
Return results for all types
    ↓
Component renders tabs with counts
    ↓
Active tab determines what to show:
    - products: Infinite scroll grid
    - others: Static list/grid
```

## URL Examples

- `/search?q=dress` → Defaults to Products tab
- `/search?q=dress&type=products` → Products with infinite scroll
- `/search?q=dress&type=articles` → Articles tab
- `/search?q=dress&type=collections` → Collections tab

## Edge Cases

1. **No search term**: Show empty state with popular searches
2. **No results for any type**: Show "No results found" with suggestions
3. **Invalid type param**: Default to products tab
4. **Direct URL access with type**: Works correctly, tab pre-selected

## Testing Checklist

- [ ] Search returns products matching title
- [ ] Search returns articles matching content
- [ ] Search returns pages matching content
- [ ] Search returns collections matching title
- [ ] Tab counts update correctly
- [ ] Active tab reflected in URL
- [ ] Infinite scroll works on products tab
- [ ] No results message displays correctly
- [ ] Tab switching preserves search term
- [ ] Browser back/forward works with tab state
