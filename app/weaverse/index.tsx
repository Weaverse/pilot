import {WeaverseHydrogenRoot} from '@weaverse/hydrogen';
import {useLoaderData, Await} from '@remix-run/react';
import {Suspense} from 'react';
import config from './config';

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
                {...config}
                data={{...rest, weaverseData}}
              />
            )}
          </Await>
        </Suspense>
      );
    }
    return <WeaverseHydrogenRoot {...config} data={data} />;
  }
  return (
    <div style={{display: 'none'}}>
      No weaverseData return from Remix loader!
    </div>
  );
}
export default WeaverseContent;
