import {json} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';

import {RouteLoaderArgs} from '@weaverse/hydrogen';
import {PageDetailsQuery} from 'storefrontapi.generated';
import {routeHeaders} from '~/data/cache';
import {PAGE_QUERY} from '~/data/queries';
import {seoPayload} from '~/lib/seo.server';
import {WeaverseContent} from '~/weaverse';

export const headers = routeHeaders;

export async function loader(args: RouteLoaderArgs) {
  let {request, params, context} = args;
  invariant(params.pageHandle, 'Missing page handle');

  const {page} = await context.storefront.query<PageDetailsQuery>(PAGE_QUERY, {
    variables: {
      handle: params.pageHandle,
      language: context.storefront.i18n.language,
    },
  });

  if (!page) {
    throw new Response(null, {status: 404});
  }

  const seo = seoPayload.page({page, url: request.url});

  return json({
    page,
    seo,
    weaverseData: await context.weaverse.loadPage(),
  });
}

export default function Page() {
  return <WeaverseContent />;
}
