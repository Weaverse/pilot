import {AnalyticsPageType} from '@shopify/hydrogen';
import {defer} from '@shopify/remix-oxygen';
import {routeHeaders} from '~/data/cache';
import {SHOP_QUERY} from '~/data/queries';
import {seoPayload} from '~/lib/seo.server';
import {WeaverseContent} from '~/weaverse';
import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import type {PageType} from '@weaverse/hydrogen';

export const headers = routeHeaders;

export async function loader(args: LoaderFunctionArgs) {
  let {params, context} = args;
  let {language, country} = context.storefront.i18n;

  let pageType: PageType = 'INDEX';
  if (
    params.locale &&
    params.locale.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    // If the locale URL param is defined, yet we still are on `EN-US`
    // the locale param must be invalid
    // Update for Weaverse: if it not locale, it probably is a custom page handle
    pageType = 'CUSTOM';
  }

  let {shop} = await context.storefront.query(SHOP_QUERY);
  let seo = seoPayload.home();

  return defer({
    shop,
    weaverseData: await context.weaverse.loadPage({
      type: pageType,
    }),
    analytics: {
      pageType: AnalyticsPageType.home,
    },
    seo,
  });
}

export default function Homepage() {
  return <WeaverseContent />;
}
