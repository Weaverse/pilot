import {LoaderArgs} from '@shopify/remix-oxygen';
import {
  WeaverseLoaderConfigs,
  studioCheck,
  weaverseLoader,
} from '@weaverse/hydrogen';
import {countries} from '~/data/countries';
import {components} from './components';
import {schema} from './schema.server';

export async function loadWeaversePage(
  args: LoaderArgs,
  configs?: WeaverseLoaderConfigs,
) {
  return await weaverseLoader(args, components, countries, configs);
}

export async function getWeaverseThemeConfigs(request: Request) {
  let isStudio = studioCheck(request);
  return isStudio ? {schema, countries} : null;
}
