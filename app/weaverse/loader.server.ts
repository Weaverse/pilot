import {LoaderArgs} from '@shopify/remix-oxygen';
import {WeaverseLoaderConfigs, weaverseLoader} from '@weaverse/hydrogen';
import {countries} from '~/data/countries';
import {components} from './components';

export async function loadWeaversePage(
  args: LoaderArgs,
  configs?: WeaverseLoaderConfigs,
) {
  return await weaverseLoader(args, components, countries, configs);
}
