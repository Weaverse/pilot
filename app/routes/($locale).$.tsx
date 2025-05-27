import type { LoaderFunctionArgs } from "@shopify/remix-oxygen";
import { WeaverseContent, validateWeaverseData } from "~/weaverse";

export async function loader({ context }: LoaderFunctionArgs) {
  let weaverseData = await context.weaverse.loadPage({
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
