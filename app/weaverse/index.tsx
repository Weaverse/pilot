import {WeaverseHydrogenRoot} from '@weaverse/hydrogen';
import components from './components';
import sections from './sections';
import {useLoaderData, Await} from '@remix-run/react';
import {Suspense} from 'react';

export let allComponents = {...components, ...sections};

function WeaverseRoot({data}) {
  return <WeaverseHydrogenRoot components={allComponents} data={data} />;
}
export function WeaverseContent() {
  let data = useLoaderData();
  let {weaverseData, ...rest} = data;
  if (weaverseData) {
    if (weaverseData.then) {
      return (
        <Suspense>
          <Await resolve={weaverseData}>
            {(weaverseData) => <WeaverseRoot data={{...rest, weaverseData}} />}
          </Await>
        </Suspense>
      );
    }
    return <WeaverseRoot data={data} />;
  }
  return (
    <div style={{display: 'none'}}>
      No weaverseData return from Remix loader!
    </div>
  );
}
export default WeaverseContent;
