import {LoaderArgs} from '@shopify/remix-oxygen';
import {WeaverseLoaderConfigs, weaverseLoader} from '@weaverse/hydrogen';
import {components} from './components';

export async function loadWeaversePage(
  args: LoaderArgs,
  configs?: WeaverseLoaderConfigs,
) {
  return await weaverseLoader(args, components, configs);
}
