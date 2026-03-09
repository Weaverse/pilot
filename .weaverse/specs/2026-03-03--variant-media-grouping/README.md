# Feature: Variant Media Grouping

| Field        | Value                              |
| ------------ | ---------------------------------- |
| **Status**   | `completed`                        |
| **Owner**    | @hta218                            |
| **Created**  | 2026-03-03                         |
| **Last Updated** | 2026-03-09                         |

## Original Prompt

> I have an idea for the product media images inside product page, we now will implement a feature that group images with variant, for e.g when visitor select a color black/cream only images that match will display instead of showing all like currently

## Summary

Filter product media on the product page based on the selected variant's option value (e.g., Color). When a visitor selects a variant option like "Black", only images assigned to variants with that option value are displayed, plus any ungrouped/shared media. The feature is opt-in via a Weaverse section toggle and configurable for which option name drives grouping. Applies to both `main-product` and `single-product` sections.
