import {getPaginationVariables} from '@shopify/hydrogen';
import {defer, type LoaderArgs} from '@shopify/remix-oxygen';

import {PAGINATION_SIZE} from '~/lib/const';
import {seoPayload} from '~/lib/seo.server';

import {SEARCH_QUERY} from '~/data/queries';
import {WeaverseContent} from '~/weaverse';
import {loadWeaversePage} from '~/weaverse/loader';
import {getFeaturedData} from './($locale).featured-products';

export async function loader(args: LoaderArgs) {
  let {
    request,
    context: {storefront},
  } = args;
  const searchParams = new URL(request.url).searchParams;
  const searchTerm = searchParams.get('q')!;
  const variables = getPaginationVariables(request, {pageBy: 8});

  const {products} = await storefront.query(SEARCH_QUERY, {
    variables: {
      searchTerm,
      ...variables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  const shouldGetRecommendations = !searchTerm || products?.nodes?.length === 0;

  const seo = seoPayload.collection({
    url: request.url,
    collection: {
      id: 'search',
      title: 'Search',
      handle: 'search',
      descriptionHtml: 'Search results',
      description: 'Search results',
      seo: {
        title: 'Search',
        description: `Showing ${products.nodes.length} search results for "${searchTerm}"`,
      },
      metafields: [],
      products,
      updatedAt: new Date().toISOString(),
    },
  });

  return defer({
    seo,
    searchTerm,
    products,
    noResultRecommendations: shouldGetRecommendations
      ? await getNoResultRecommendations(storefront)
      : null,
    weaverseData: await loadWeaversePage(args),
  });
}

export default function Search() {
  return <WeaverseContent />;
}

export async function getNoResultRecommendations(
  storefront: LoaderArgs['context']['storefront'],
) {
  return await getFeaturedData(storefront, {pageBy: PAGINATION_SIZE});
}
