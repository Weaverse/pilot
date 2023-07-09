import type {HydrogenPageData} from '@weaverse/hydrogen';
import {WeaverseHydrogenRoot} from '@weaverse/hydrogen';
import {useLoaderData, Await} from '@remix-run/react';
import {Suspense} from 'react';

import {components, themeSchema} from './config';

export function WeaverseContent() {
  let {weaverseData} = useLoaderData() as {
    weaverseData: HydrogenPageData | Promise<HydrogenPageData>;
  };
  if (weaverseData) {
    if (weaverseData instanceof Promise) {
      return (
        <Suspense>
          <Await resolve={weaverseData}>
            {(resolvedData: HydrogenPageData) => (
              <WeaverseHydrogenRoot
                components={components}
                themeSchema={themeSchema}
                weaverseData={resolvedData}
              />
            )}
          </Await>
        </Suspense>
      );
    }
    return (
      <WeaverseHydrogenRoot
        components={components}
        themeSchema={themeSchema}
        weaverseData={weaverseData}
      />
    );
  }
  return (
    <div style={{display: 'none'}}>
      No weaverseData return from Remix loader!
    </div>
  );
}
export default WeaverseContent;
