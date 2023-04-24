import {WeaverseHydrogenRoot} from '@weaverse/hydrogen';
import components from './components';
import {useLoaderData, Await} from '@remix-run/react';
import {Suspense} from 'react';
export function RenderWeaverse() {
  let {weaverseData, ...rest} = useLoaderData();
  if (weaverseData) {
    // if weaverseData is Promise (Remix deferred loader)
    if (weaverseData.then) {
      return (
        <Suspense>
          <Await resolve={weaverseData}>
            {(weaverseData) => {
              return (
                <WeaverseHydrogenRoot
                  components={components}
                  data={{...rest, weaverseData}}
                />
              );
            }}
          </Await>
        </Suspense>
      );
    }
    return (
      <WeaverseHydrogenRoot
        components={components}
        data={{...rest, weaverseData}}
      />
    );
  }
  return null;
}
export default RenderWeaverse;
