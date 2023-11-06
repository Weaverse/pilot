import {getPaginationVariables} from '@shopify/hydrogen';
import {json} from '@shopify/remix-oxygen';
import {type RouteLoaderArgs} from '@weaverse/hydrogen';
import {routeHeaders} from '~/data/cache';
import {COLLECTIONS_QUERY} from '~/data/queries';
import {seoPayload} from '~/lib/seo.server';
import {WeaverseContent} from '~/weaverse';

const PAGINATION_SIZE = 4;

export const headers = routeHeaders;

export const loader = async (args: RouteLoaderArgs) => {
  let {
    request,
    context: {storefront, weaverse},
  } = args;
  const variables = getPaginationVariables(request, {pageBy: PAGINATION_SIZE});
  const {collections} = await storefront.query(COLLECTIONS_QUERY, {
    variables: {
      ...variables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  const seo = seoPayload.listCollections({
    collections,
    url: request.url,
  });

  return json({
    collections,
    seo,
    weaverseData: await weaverse.loadPage(),
  });
};

export default function Collections() {
  return <WeaverseContent />;
}
