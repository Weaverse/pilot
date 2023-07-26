import {Await, useLoaderData, useNavigate} from '@remix-run/react';
import type {WeaverseLoaderData} from '@weaverse/hydrogen';
import {WeaverseHydrogenRoot} from '@weaverse/hydrogen';
import {Suspense} from 'react';
import {components} from './components';
import {themeSchema} from './theme-schema';

export function WeaverseContent() {
  let navigate = useNavigate();
  let loaderData = useLoaderData();
  let weaverseData: WeaverseLoaderData | Promise<WeaverseLoaderData> =
    loaderData.weaverseData;

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
