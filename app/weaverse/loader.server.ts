import {LoaderArgs} from '@shopify/remix-oxygen';
import {type WeaverseLoaderConfigs, weaverseLoader} from '@weaverse/hydrogen';
import {countries} from '~/data/countries';
import {components} from './components';

export function loadWeaversePage(
  args: LoaderArgs,
  configs?: WeaverseLoaderConfigs,
) {
  return weaverseLoader(args, components, countries, configs);
}
