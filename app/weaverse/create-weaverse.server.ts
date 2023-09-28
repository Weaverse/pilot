import {Storefront, createWithCache} from '@shopify/hydrogen';
import {
  I18nLocale,
  WeaverseClient,
  getWeaverseConfigs,
} from '@weaverse/hydrogen';
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

export function createWeaverseClient({
  storefront,
  request,
  env,
  cache,
  waitUntil,
}: CreateWeaverseArgs) {
  return new WeaverseClient({
    storefront,
    countries,
    themeSchema,
    components,
    configs: getWeaverseConfigs(request, env),
    withCache: createWithCache({cache, waitUntil}),
  });
}
