import type {ShopifyAnalyticsProduct} from '@shopify/hydrogen';
import {AnalyticsPageType} from '@shopify/hydrogen';
import type {SelectedOptionInput} from '@shopify/hydrogen/storefront-api-types';
import {defer, type LoaderArgs} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';
import {routeHeaders} from '~/data/cache';
import {PRODUCT_QUERY} from '~/data/queries';
import {seoPayload} from '~/lib/seo.server';
import {WeaverseContent} from '~/weaverse';
import {loadWeaversePage} from '~/weaverse/loader';

export const headers = routeHeaders;

export async function loader(args: LoaderArgs) {
  let {params, request, context} = args;
  const {productHandle} = params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  const searchParams = new URL(request.url).searchParams;

  const selectedOptions: SelectedOptionInput[] = [];
  searchParams.forEach((value, name) => {
    selectedOptions.push({name, value});
  });

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
    shop,
    analytics: {
      pageType: AnalyticsPageType.product,
      resourceId: product.id,
      products: [productAnalytics],
      totalValue: parseFloat(selectedVariant.price.amount),
    },
    seo,
    weaverseData: await loadWeaversePage(args),
  });
}

export default function Product() {
  return <WeaverseContent />;
}
