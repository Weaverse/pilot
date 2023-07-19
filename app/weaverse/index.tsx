import type {WeaverseLoaderData} from '@weaverse/hydrogen';
import {WeaverseHydrogenRoot} from '@weaverse/hydrogen';
import {useLoaderData, Await, useNavigate} from '@remix-run/react';
import {Suspense} from 'react';

import {components, themeSchema} from './config';

export function WeaverseContent() {
  let {weaverseData} = useLoaderData() as {
    weaverseData: WeaverseLoaderData | Promise<WeaverseLoaderData>;
  };
  let navigate = useNavigate();

  if (weaverseData) {
    if (weaverseData instanceof Promise) {
      return (
        <Suspense>
          <Await resolve={weaverseData}>
            {(resolvedData: WeaverseLoaderData) => (
              <WeaverseHydrogenRoot
                components={components}
                themeSchema={themeSchema}
                weaverseData={resolvedData}
                navigate={navigate}
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
        navigate={navigate}
      />
    );
  }
  return (
    <div style={{display: 'none'}}>
      No weaverseData return from Remix loader!
    </div>
  );
}
