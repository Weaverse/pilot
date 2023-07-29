import {flattenConnection} from '@shopify/hydrogen';
import {json, type LoaderArgs} from '@shopify/remix-oxygen';
import type {BlogQuery} from 'storefrontapi.generated';
import invariant from 'tiny-invariant';
import {routeHeaders} from '~/data/cache';
import {BLOGS_QUERY} from '~/data/queries';
import {PAGINATION_SIZE} from '~/lib/const';
import {seoPayload} from '~/lib/seo.server';
import {WeaverseContent} from '~/weaverse';
import {loadWeaversePage} from '~/weaverse/loader';

export const headers = routeHeaders;

export const loader = async (args: LoaderArgs) => {
  let {
    params,
    request,
    context: {storefront},
  } = args;
  const {language, country} = storefront.i18n;

  invariant(params.blogHandle, 'Missing blog handle');

  const {blog} = await storefront.query<BlogQuery>(BLOGS_QUERY, {
    variables: {
      blogHandle: params.blogHandle,
      pageBy: PAGINATION_SIZE,
      language,
    },
  });

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  const articles = flattenConnection(blog.articles).map((article) => {
    const {publishedAt} = article!;
    return {
      ...article,
      publishedAt: new Intl.DateTimeFormat(`${language}-${country}`, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(publishedAt!)),
    };
  });

  const seo = seoPayload.blog({blog, url: request.url});

  return json({
    blog,
    articles,
    seo,
    weaverseData: await loadWeaversePage(args),
  });
};

export default function Journals() {
  return <WeaverseContent />;
}
