import type {Storefront} from '@shopify/hydrogen';
import type {I18nLocale} from '@weaverse/hydrogen';
import {WeaverseClient} from '@weaverse/hydrogen';
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
  let weaverseHosts = ['weaverse.io', '*.weaverse.io'];
  if (weaverseHost) {
    weaverseHosts.push(weaverseHost);
  }
  return {
    frameAncestors: weaverseHosts,
    defaultSrc: [
      "'self'",
      'cdn.shopify.com',
      'shopify.com',
      '*.youtube.com',
      '*.google.com',
      'fonts.gstatic.com',
      ...weaverseHosts,
    ],
    imgSrc: [
      "'self'",
      'data:',
      'cdn.shopify.com',
      'localhost:3556',
      ...weaverseHosts,
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'fonts.googleapis.com',
      'cdn.shopify.com',
      'localhost:3556',
      ...weaverseHosts,
    ],
  };
}
