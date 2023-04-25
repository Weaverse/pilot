import {WeaverseHydrogenRoot} from '@weaverse/hydrogen';
import components from './components';
import {useLoaderData, Await} from '@remix-run/react';
import {Suspense} from 'react';

const WeaverseHydrogenDisplay = ({data}) => (
  <WeaverseHydrogenRoot components={components} data={data} />
);
export function RenderWeaverse() {
  let {weaverseData, ...rest} = useLoaderData();
  if (weaverseData) {
    // if weaverseData is Promise (Remix deferred loader)
    if (weaverseData.then) {
      return (
        <Suspense>
          <Await resolve={weaverseData}>
            {(weaverseData) => {
              return <WeaverseHydrogenDisplay data={{...rest, weaverseData}} />;
            }}
          </Await>
        </Suspense>
      );
    }
    return <WeaverseHydrogenDisplay data={{...rest, weaverseData}} />;
  }
  return (
    <div style={{display: 'none'}}>
      No weaverseData is returned from Remix loader!
    </div>
  );
}
export default RenderWeaverse;
