# Feature: Product Media Show More

| Field            | Value                                                    |
| ---------------- | -------------------------------------------------------- |
| **Status**       | in-progress                                              |
| **Owner**        | @hta218                                                  |
| **Created**      | 2026-03-04                                               |
| **Last Updated** | 2026-03-04                                               |

## Original Prompt

> Good, now I want to implement this feature: all media are show by default, we need to set an initial media to show only, then we should have a "show more" button at the end of the media list that when click will show the rest (still apply with the variant media group logic). this should work with grid layout in the main product page only

## Summary

Adds a configurable "show more / show less" toggle to the product media grid layout on the main product page. Merchants can set how many media items are visible initially via Weaverse Studio; remaining items are revealed with a customizable button. Works with variant media grouping — the slice happens after variant filtering.
