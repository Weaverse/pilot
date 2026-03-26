# Feature: Model Viewer Support

| Field            | Value          |
| ---------------- | -------------- |
| **Status**       | completed      |
| **Owner**        | @hta218        |
| **Created**      | 2026-03-26     |
| **Last Updated** | 2026-03-26     |

## Original Prompt

> Help me add model viewer support for our Hydrogen theme
> Here is docs from Shopify: https://shopify.dev/docs/api/hydrogen/2025-07/components/media/modelviewer

## Summary

Add rendering support for 3D models (`Model3d`) and external videos (`ExternalVideo`) in the product media system. The GraphQL fragment and TypeScript types already handle both media types, but the UI components (`MediaItem`, `ZoomMedia`) only render `IMAGE` and `VIDEO` — returning `null` for `MODEL_3D` and `EXTERNAL_VIDEO`.
