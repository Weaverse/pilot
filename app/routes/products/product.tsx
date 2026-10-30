import {
  buildProductSelectionSearchParams,
  type ValidProductSelectionResult,
} from "@shopify/hydrogen";
import { getSelectedProductOptions } from "@weaverse/hydrogen/react-router";
import { useEffect } from "react";
import type { LoaderFunctionArgs, MetaArgs } from "react-router";
import { useLoaderData, useLocation, useNavigate } from "react-router";
import invariant from "tiny-invariant";
import { redirectIfHandleIsLocalized } from "~/.server/redirect";
import { seoPayload } from "~/.server/seo";
import {
  type ProductFormData,
  ProductProvider,
  productOptionPath,
  useSelectedVariant,
} from "~/components/product/product-form";
import { ProductView } from "~/components/root/analytics-views";
import { PRODUCT_QUERY } from "~/graphql/queries";
import { CACHE_DEFAULT, routeHeaders } from "~/utils/cache";
import { localizePath, resolveLocale } from "~/utils/locale";
import { seoMetaFromMatches } from "~/utils/seo";
import { unwrapStorefront } from "~/utils/storefront";
import { WeaverseContent } from "~/weaverse";
import { getRecommendedProducts } from "./recommended-product";

export const headers = routeHeaders;

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const { productHandle: handle } = params;

  invariant(handle, "Missing productHandle param, check route filename");

  const { storefront, weaverse } = context;
  const selectedOptions = getSelectedProductOptions(request);
  const [{ shop, product }, weaverseData] = await Promise.all([
    storefront
      .graphql(PRODUCT_QUERY, {
        variables: { handle, selectedOptions },
        cache: CACHE_DEFAULT,
      })
      .then(unwrapStorefront),
    weaverse.loadPage({ type: "PRODUCT", handle }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response("product", { status: 404 });
  }
  redirectIfHandleIsLocalized(request, { handle, data: product });

  // Use Hydrogen/Remix streaming for recommended products
  const recommended = getRecommendedProducts(storefront, product.id);

  return {
    shop,
    product,
    weaverseData,
    seo: seoPayload.product({ product, url: request.url }),
    recommended,
    selectedOptions,
  };
}

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
  return seoMetaFromMatches(matches);
};

export default function Product() {
  const { product } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  useSyncSelectionToUrl(product);

  // A selection updates every section through the product form at once; the
  // URL follows with a client-side replace that keeps the scroll position.
  // A variant the page already loaded needs no loader round trip; one it
  // didn't (`unresolved`) revalidates, and the loader's answer hydrates the
  // form. Combined-listing values link to the other product instead.
  function handleSelect(result: ValidProductSelectionResult<ProductFormData>) {
    const path = productOptionPath(
      product,
      result.selectedOptions,
      result.selectedVariant?.product?.handle,
      new URLSearchParams(search),
    );
    navigate(localizePath(path, resolveLocale(pathname)), {
      replace: true,
      preventScrollReset: true,
      ...(result.status === "resolved"
        ? { defaultShouldRevalidate: false }
        : {}),
    });
  }

  return (
    <ProductProvider product={product} onSelect={handleSelect}>
      <WeaverseContent />
      <ProductAnalytics product={product} />
    </ProductProvider>
  );
}

function ProductAnalytics({ product }: { product: ProductFormData }) {
  const selectedVariant = useSelectedVariant(product);
  return (
    <ProductView
      products={[
        {
          id: product.id,
          title: product.title,
          price: selectedVariant?.price ?? product.priceRange.minVariantPrice,
          vendor: product.vendor,
          variantId: selectedVariant?.id || "",
          variantTitle: selectedVariant?.title || "",
          quantity: 1,
        },
      ]}
    />
  );
}

/**
 * Writes the server-selected variant's options into the URL when the URL
 * doesn't carry them yet (a bare `/products/:handle` link, a case-insensitive
 * or partial match), so the address bar always names the variant on screen.
 *
 * This mirrors the request rather than navigating, so it doesn't count as a
 * new page view or revalidate the route. React Router's history state is
 * kept as-is; its own location keeps the original search, which only serves
 * as the base for unrelated params.
 */
function useSyncSelectionToUrl(product: ProductFormData) {
  const variant = product.selectedOrFirstAvailableVariant;

  useEffect(() => {
    if (!variant) {
      return;
    }
    const url = new URL(window.location.href);
    const inSync = variant.selectedOptions.every(
      ({ name, value }) => url.searchParams.get(name) === value,
    );
    if (inSync) {
      return;
    }
    const params = buildProductSelectionSearchParams({
      selectedOptions: variant.selectedOptions,
      optionNames: product.options.map((option) => option.name),
      base: url.searchParams,
    });
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}?${params}${url.hash}`,
    );
  }, [variant, product.options]);
}
