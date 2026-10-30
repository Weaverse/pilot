import type { GraphQLFormattedError } from "@shopify/hydrogen";

/**
 * The data of a Storefront API result, or a thrown error when Shopify returned
 * GraphQL errors.
 *
 * Hydrogen 2026.10's `graphql()` returns `{ data, errors, headers }` instead of
 * throwing; classic `storefront.query()` threw on errors. Pilot's loaders were
 * written against the throwing contract (a failed query becomes the route's
 * error boundary, never a half-rendered page), so they unwrap through this.
 * Loaders that can render with partial data read `result.data` directly.
 */
export function unwrapStorefront<T>(result: {
  data: T | null;
  errors?: GraphQLFormattedError[];
}): T {
  if (result.errors?.length || !result.data) {
    const messages = result.errors?.map(({ message }) => message) ?? [
      "No data returned",
    ];
    throw new Error(`[storefront.graphql] ${messages.join("\n")}`);
  }
  return result.data;
}
