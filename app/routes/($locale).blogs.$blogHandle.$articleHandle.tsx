import {json, type LinksFunction, type LoaderArgs} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';
import {routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import {ArticleDetailsQuery} from 'storefrontapi.generated';
import {ARTICLE_QUERY} from '~/data/queries';
import {WeaverseContent} from '~/weaverse';
import {loadWeaversePage} from '~/weaverse/loader.server';
import styles from '../styles/custom-font.css';

export const headers = routeHeaders;

export const links: LinksFunction = () => {
  return [{rel: 'stylesheet', href: styles}];
};

export async function loader(args: LoaderArgs) {
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

  const formattedDate = new Intl.DateTimeFormat(`${language}-${country}`, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article?.publishedAt!));

  const seo = seoPayload.article({article, url: request.url});

  return json({
    article,
    formattedDate,
    seo,
    weaverseData: await loadWeaversePage(args),
  });
}

export default function Article() {
  return <WeaverseContent />;
}
