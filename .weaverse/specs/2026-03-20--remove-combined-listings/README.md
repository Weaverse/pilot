# Feature: Remove Combined Listings

| Field            | Value                                |
| ---------------- | ------------------------------------ |
| **Status**       | `draft`                              |
| **Owner**        | @hta218                              |
| **Created**      | 2026-03-20                           |
| **Last Updated** | 2026-03-20                           |

## Original Prompt

> I want to remove the code related to [combined listings] feature to reduce the complicated in the source, cause not everybody need this, we will keep the cookbook so whoever want the feature can easily read the cookbook to add.

## Summary

Remove all combined-listings code from the Pilot codebase (16+ files) to reduce complexity. The feature is Shopify Plus-only and most stores don't use it. The cookbook at `.guides/cookbooks/combined-listings.md` will be updated to match Pilot's actual architecture before code removal, so it serves as a valid re-implementation guide.
