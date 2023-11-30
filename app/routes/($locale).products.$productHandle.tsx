import type {ShopifyAnalyticsProduct} from '@shopify/hydrogen';
import {AnalyticsPageType} from '@shopify/hydrogen';
import {defer, redirect} from '@shopify/remix-oxygen';
import {type RouteLoaderArgs} from '@weaverse/hydrogen';
import type {
  ProductQuery,
  ProductRecommendationsQuery,
} from 'storefrontapi.generated';
import invariant from 'tiny-invariant';
import {routeHeaders} from '~/data/cache';
import {
  PRODUCT_QUERY,
  RECOMMENDED_PRODUCTS_QUERY,
  VARIANTS_QUERY,
} from '~/data/queries';
import {seoPayload} from '~/lib/seo.server';
import type {Storefront} from '~/lib/type';
import {WeaverseContent} from '~/weaverse';
import {getSelectedProductOptions} from '@weaverse/hydrogen';

export const headers = routeHeaders;

export async function loader({params, request, context}: RouteLoaderArgs) {
  const {productHandle} = params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  const selectedOptions = getSelectedProductOptions(request);
  const {shop, product} = await context.storefront.query(PRODUCT_QUERY, {
    variables: {
      handle: productHandle,
      selectedOptions,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  if (!product?.id) {
    throw new Response('product', {status: 404});
  }

  if (!product.selectedVariant) {
    throw redirectToFirstVariant({product, request});
  }

  // In order to show which variants are available in the UI, we need to query
  // all of them. But there might be a *lot*, so instead separate the variants
  // into it's own separate query that is deferred. So there's a brief moment
  // where variant options might show as available when they're not, but after
  // this deferred query resolves, the UI will update.
  const variants = context.storefront.query(VARIANTS_QUERY, {
    variables: {
      handle: productHandle,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  const recommended = getRecommendedProducts(context.storefront, product.id);

  // TODO: firstVariant is never used because we will always have a selectedVariant due to redirect
  // Investigate if we can avoid the redirect for product pages with no search params for first variant
  const firstVariant = product.variants.nodes[0];
  const selectedVariant = product.selectedVariant ?? firstVariant;

  const productAnalytics: ShopifyAnalyticsProduct = {
    productGid: product.id,
    variantGid: selectedVariant.id,
    name: product.title,
    variantName: selectedVariant.title,
    brand: product.vendor,
    price: selectedVariant.price.amount,
  };

  const seo = seoPayload.product({
    product,
    selectedVariant,
    url: request.url,
  });

  return defer({
    variants,
    product,
    shop,
    storeDomain: shop.primaryDomain.url,
    recommended,
    analytics: {
      pageType: AnalyticsPageType.product,
      resourceId: product.id,
      products: [productAnalytics],
      totalValue: parseFloat(selectedVariant.price.amount),
    },
    seo,
    weaverseData: await context.weaverse.loadPage(),
  });
}

function redirectToFirstVariant({
  product,
  request,
}: {
  product: ProductQuery['product'];
  request: Request;
}) {
  const searchParams = new URLSearchParams(new URL(request.url).search);
  const firstVariant = product!.variants.nodes[0];
  for (const option of firstVariant.selectedOptions) {
    searchParams.set(option.name, option.value);
  }

  return redirect(
    `/products/${product!.handle}?${searchParams.toString()}`,
    302,
  );
}

export default function Product() {
  return <WeaverseContent />;
}

async function getRecommendedProducts(
  storefront: Storefront,
  productId: string,
) {
  const products = await storefront.query<ProductRecommendationsQuery>(
    RECOMMENDED_PRODUCTS_QUERY,
    {
      variables: {productId, count: 12},
    },
  );

  invariant(products, 'No data returned from Shopify API');

  const mergedProducts = (products.recommended ?? [])
    .concat(products.additional.nodes)
    .filter(
      (value, index, array) =>
        array.findIndex((value2) => value2.id === value.id) === index,
    );

  const originalProduct = mergedProducts.findIndex(
    (item) => item.id === productId,
  );

  mergedProducts.splice(originalProduct, 1);

  return {nodes: mergedProducts};
}
