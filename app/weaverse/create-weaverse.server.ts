import {WeaverseClient} from '@weaverse/hydrogen';
import type {CreateWeaverseClientArgs} from '@weaverse/hydrogen';

import {components} from '~/weaverse/components';
import {themeSchema} from '~/weaverse/schema.server';

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
  let weaverseHost = url.searchParams.get('weaverseHost');
  let isDesignMode = url.searchParams.get('weaverseHost');
  let weaverseHosts = ['*.weaverse.io', '*.shopify.com', '*.myshopify.com'];
  if (weaverseHost) {
    weaverseHosts.push(weaverseHost);
  }
  let updatedCsp: {
    [x: string]: string[] | string | boolean;
  } = {
    defaultSrc: [
      'data:',
      '*.youtube.com',
      '*.youtu.be',
      '*.vimeo.com',
      '*.google.com',
      '*.google-analytics.com',
      '*.googletagmanager.com',
      'fonts.gstatic.com',
      ...weaverseHosts,
    ],
    styleSrc: ['fonts.googleapis.com', ...weaverseHosts],
    connectSrc: ['vimeo.com', '*.google-analytics.com', ...weaverseHosts],
  };
  if (isDesignMode) {
    updatedCsp.frameAncestors = ['*'];
  }
  return updatedCsp;
}
