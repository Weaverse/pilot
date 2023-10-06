import {getPaginationVariables} from '@shopify/hydrogen';
import {json} from '@shopify/remix-oxygen';
import {RouteLoaderArgs} from '@weaverse/hydrogen';
import {AllProductsQuery} from 'storefrontapi.generated';
import invariant from 'tiny-invariant';
import {routeHeaders} from '~/data/cache';
import {ALL_PRODUCTS_QUERY} from '~/data/queries';
import {seoPayload} from '~/lib/seo.server';
import {WeaverseContent} from '~/weaverse';

const PAGE_BY = 8;

export const headers = routeHeaders;

export async function loader(args: RouteLoaderArgs) {
  let {request, context} = args;
  const variables = getPaginationVariables(request, {pageBy: PAGE_BY});

  const data = await context.storefront.query<AllProductsQuery>(
    ALL_PRODUCTS_QUERY,
    {
      variables: {
        ...variables,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    },
  );

  invariant(data, 'No data returned from Shopify API');

  const seo = seoPayload.collection({
    url: request.url,
    collection: {
      id: 'all-products',
      title: 'All Products',
      handle: 'products',
      descriptionHtml: 'All the store products',
      description: 'All the store products',
      seo: {
        title: 'All Products',
        description: 'All the store products',
      },
      metafields: [],
      products: data.products,
      updatedAt: '',
    },
  });

  return json({
    products: data.products,
    seo,
    weaverseData: await context.weaverse.loadPage(),
  });
}

export default function AllProducts() {
  return <WeaverseContent />;
}
