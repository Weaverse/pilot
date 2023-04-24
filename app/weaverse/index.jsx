import {WeaverseHydrogenRoot} from '@weaverse/hydrogen';
import components from './components';
import {useLoaderData} from '@remix-run/react';

export default function RenderWeaverse() {
  let data = useLoaderData();
  return <WeaverseHydrogenRoot components={components} data={data} />;
}
