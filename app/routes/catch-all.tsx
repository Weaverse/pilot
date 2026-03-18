import type { LoaderFunctionArgs } from "react-router";
import { validateWeaverseData, WeaverseContent } from "~/weaverse";
import { routeHeaders } from "~/utils/cache";

export let headers = routeHeaders;

export async function loader({ context }: LoaderFunctionArgs) {
  const weaverseData = await context.weaverse.loadPage({
    type: "CUSTOM",
  });
  validateWeaverseData(weaverseData);

  return {
    weaverseData,
  };
}

export default function Component() {
  return <WeaverseContent />;
}
