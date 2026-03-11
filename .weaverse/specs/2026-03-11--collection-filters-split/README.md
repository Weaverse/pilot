# Feature: Collection Filters Split

| Field            | Value                                                    |
| ---------------- | -------------------------------------------------------- |
| **Status**       | draft                                                    |
| **Owner**        | @hta218                                                  |
| **Created**      | 2026-03-11                                               |
| **Last Updated** | 2026-03-11                                               |

## Original Prompt

> The @app/sections/collection-filters/ is now kinda complex, I want split it into multiple child (banner, toolbar, filter, product-pagination). Help check the code base & structure to see if it possible, also recommend me a solution for the best management.

## Summary

Refactor the monolithic `collection-filters` section into a composable parent-child Weaverse section. Split into 4 independently registered child components (banner, toolbar, filters, product-pagination), each with their own schema settings configurable in the Weaverse editor. This follows the established pattern used by `main-product`, `testimonials`, and `columns-with-images` sections.
