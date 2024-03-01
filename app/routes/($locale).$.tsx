import { WeaverseContent } from '~/weaverse';
import { type LoaderFunctionArgs } from '@shopify/remix-oxygen';

export async function loader({ context }: LoaderFunctionArgs) {
  let weaverseData = await context.weaverse.loadPage({
    type: 'CUSTOM',
  });

  if (weaverseData?.page?.id && !weaverseData.page.id.includes('fallback')) {
    return {
      weaverseData,
    };
  }
  throw new Response(null, { status: 404 });
}

export default function Component() {
  return <WeaverseContent />;
}
