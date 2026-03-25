# Feature: Enhanced Search Page with Tabs and Multi-Type Results

| Field            | Value                                                    |
| ---------------- | -------------------------------------------------------- |
| **Status**       | in-progress                                              |
| **Owner**        | @hta218                                                  |
| **Created**      | 2026-03-25                                               |
| **Last Updated** | 2026-03-25                                               |

## Original Prompt

> Guess we need a plan to update this search page, here are what I want:
> 1. use search query instead of products query
> 2. add more things to query just like predictive search
> 3. update layout to use tab to switch between result (product should be the default active tab)
> 4. apply infinite scroll for this page (use @app/components/product-grid/products-loaded-on-scroll.tsx component)
> 5. Clarified: Tabs show result counts (e.g., "Products (24)" / "Articles (5)" / "Pages (3)")
> 6. Clarified: No "All" tab - separate tabs for each type
> 7. Clarified: Include Products, Articles, Pages, Collections
> 8. Clarified: Infinite scroll applies to products tab only
> 9. Clarified: Show "No results" message for empty tabs
> 10. Clarified: Active tab in URL (?type=products|articles|pages|collections)

## Summary

Enhance the search page to support multi-type search results (products, articles, pages, collections) with a tabbed interface. Products tab uses infinite scroll while other tabs show static results. Each tab displays result counts and the active tab is reflected in the URL for shareability.
