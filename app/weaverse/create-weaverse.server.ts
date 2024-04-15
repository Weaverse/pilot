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
      '*.youtube.com',
      '*.youtu.be',
      '*.vimeo.com',
      '*.google.com',
      'fonts.gstatic.com',
      ...weaverseHosts,
    ],
    styleSrc: ['fonts.googleapis.com', ...weaverseHosts],
    connectSrc: ['https://vimeo.com', ...weaverseHosts],
  };
  if (isDesignMode) {
    updatedCsp.frameAncestors = ['*'];
  }
  return updatedCsp;
}
