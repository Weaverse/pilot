import type {
  HydrogenComponent,
  HydrogenComponentProps,
} from '@weaverse/hydrogen';
import {WeaverseHydrogenRoot} from '@weaverse/hydrogen';
import {useLoaderData, Await} from '@remix-run/react';
import {Suspense} from 'react';

import {components} from './components';
import {sections} from './sections';

export let allComponents: Record<string, HydrogenComponent<any>> = {
  ...components,
  ...sections,
};

export function WeaverseContent() {
  let data = useLoaderData();
  let {weaverseData, ...rest} = data;
  if (weaverseData) {
    if (weaverseData.then) {
      return (
        <Suspense>
          <Await resolve={weaverseData}>
            {(weaverseData) => (
              <WeaverseHydrogenRoot
                components={allComponents}
                data={{...rest, weaverseData}}
              />
            )}
          </Await>
        </Suspense>
      );
    }
    return <WeaverseHydrogenRoot components={allComponents} data={data} />;
  }
  return (
    <div style={{display: 'none'}}>
      No weaverseData return from Remix loader!
    </div>
  );
}
export default WeaverseContent;
