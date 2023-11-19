import {Storefront} from '@shopify/hydrogen';
import {I18nLocale, WeaverseClient} from '@weaverse/hydrogen';
import {countries} from '~/data/countries';
import {components} from '~/weaverse/components';
import {themeSchema} from '~/weaverse/schema.server';

type CreateWeaverseArgs = {
  storefront: Storefront<I18nLocale>;
  request: Request;
  env: Env;
  cache: Cache;
  waitUntil: ExecutionContext['waitUntil'];
};

export function createWeaverseClient(args: CreateWeaverseArgs) {
  return new WeaverseClient({
    ...args,
    countries,
    themeSchema,
    components,
  });
}

export function getWeaverseCsp(request: Request) {
  let url = new URL(request.url);
  // Get weaverse host from query params
  let weaverseHost = url.searchParams.get('weaverseHost');
  let weaverseHosts = ['https://*.weaverse.io'];
  if (weaverseHost) {
    weaverseHosts.push(weaverseHost);
  }
  return {
    frameAncestors: weaverseHosts,
    defaultSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://shopify.com',
      'https://*.youtube.com',
      'https://fonts.gstatic.com',
      'https://*.google.com',
      ...weaverseHosts,
    ],
    imgSrc: [
      "'self'",
      "data:",
      'https://cdn.shopify.com',
      ...weaverseHosts,
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://cdn.shopify.com',
      ...weaverseHosts,
    ],
  };
}
