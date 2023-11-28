import {json} from '@shopify/remix-oxygen';
import {type RouteLoaderArgs} from '@weaverse/hydrogen';
import type {ArticleDetailsQuery} from 'storefrontapi.generated';
import invariant from 'tiny-invariant';
import {routeHeaders} from '~/data/cache';
import {ARTICLE_QUERY} from '~/data/queries';
import {seoPayload} from '~/lib/seo.server';
import {WeaverseContent} from '~/weaverse';

// import styles from '../styles/custom-font.css';

export const headers = routeHeaders;

// export const links: LinksFunction = () => {
//   return [{rel: 'stylesheet', href: styles}];
// };

export async function loader(args: RouteLoaderArgs) {
  let {request, params, context} = args;
  const {language, country} = context.storefront.i18n;

  invariant(params.blogHandle, 'Missing blog handle');
  invariant(params.articleHandle, 'Missing article handle');

  const {blog} = await context.storefront.query<ArticleDetailsQuery>(
    ARTICLE_QUERY,
    {
      variables: {
        blogHandle: params.blogHandle,
        articleHandle: params.articleHandle,
        language,
      },
    },
  );

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  const article = blog.articleByHandle;
  const relatedArticles = blog.articles.nodes.filter(
    (art) => art?.handle !== params?.articleHandle,
  );

  const formattedDate = new Intl.DateTimeFormat(`${language}-${country}`, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article?.publishedAt!));

  const seo = seoPayload.article({article, url: request.url});

  return json({
    article,
    blog: {
      handle: params.blogHandle,
    },
    relatedArticles,
    formattedDate,
    seo,
    weaverseData: await context.weaverse.loadPage(),
  });
}

export default function Article() {
  return <WeaverseContent />;
}
