import { redirect } from "@shopify/remix-oxygen";
import type { ProductQuery } from "storefront-api.generated";
import { isCombinedListing } from "~/utils/combined-listings";

export function redirectIfHandleIsLocalized(
  request: Request,
  ...localizedResources: Array<{
    handle: string;
    data: { handle: string } & unknown;
  }>
) {
  const url = new URL(request.url);
  let shouldRedirect = false;

  for (const { handle, data } of localizedResources) {
    if (handle !== data.handle) {
      url.pathname = url.pathname.replace(handle, data.handle);
      shouldRedirect = true;
    }
  }

  if (shouldRedirect) {
    throw redirect(url.toString());
  }
}

export function redirectIfCombinedListing(
  request: Request,
  product: ProductQuery["product"],
) {
  const url = new URL(request.url);
  let shouldRedirect = false;

  if (isCombinedListing(product)) {
    url.pathname = url.pathname.replace(
      product.handle,
      product.selectedOrFirstAvailableVariant?.product.handle ?? "",
    );
    shouldRedirect = true;
  }

  if (shouldRedirect) {
    throw redirect(url.toString());
  }
}
