import {WeaverseContent} from '~/weaverse';
import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({context}: LoaderFunctionArgs) {
  let weaverseData = await context.weaverse.loadPage({
    type: 'CUSTOM',
  });
  if (!weaverseData) {
    return new Response(null, {status: 404});
  }
  return {
    weaverseData,
  };
}

export default function Component() {
  return <WeaverseContent />;
}
