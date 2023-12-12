import {WeaverseClient} from '@weaverse/hydrogen';
import {components} from '~/weaverse/components';
import {themeSchema} from '~/weaverse/schema.server';
import type {CreateWeaverseClientArgs} from '@weaverse/hydrogen/src';

export function createWeaverseClient(args: CreateWeaverseClientArgs) {
  return new WeaverseClient({
    ...args,
    themeSchema,
    components,
  });
}

export function getWeaverseCsp(request: Request) {
  let url = new URL(request.url);
  // Get weaverse host from query params
  let localDirectives =
    process.env.NODE_ENV === 'development'
      ? ['localhost:*', 'ws://localhost:*', 'ws://127.0.0.1:*']
      : [];
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
      ...localDirectives,
      ...weaverseHosts,
    ],
    imgSrc: [
      "'self'",
      'data:',
      'cdn.shopify.com',
      ...localDirectives,
      ...weaverseHosts,
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'fonts.googleapis.com',
      'cdn.shopify.com',
      ...localDirectives,
      ...weaverseHosts,
    ],
    connectSrc: [
      "'self'",
      'https://monorail-edge.shopifysvc.com',
      ...localDirectives,
      ...weaverseHosts,
    ],
  };
}
