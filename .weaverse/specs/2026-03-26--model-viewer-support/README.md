# Feature: Model Viewer Support

| Field            | Value                                                    |
| ---------------- | -------------------------------------------------------- |
| **Status**       | completed                                                |
| **Owner**        | @hta218                                                  |
| **Created**      | 2026-03-26                                               |
| **Last Updated** | 2026-03-26                                               |

## Original Prompt

> I want to add feature to support model viewer in my Hydrogen storefront starter, read this docs: https://shopify.dev/docs/api/hydrogen/2025-07/components/media/modelviewer please. Also read these message from Shopify:
> [Detailed Shopify documentation about ModelViewer component and how to implement 3D model rendering in Hydrogen]

## Summary

Adds support for rendering 3D model media files (.glb/.usdz) uploaded to Shopify products using Hydrogen's ModelViewer component. This allows customers to view interactive 3D models directly on product pages. The implementation integrates with the existing product media system (grid and slider layouts) and includes proper UI indicators and zoom modal support.
