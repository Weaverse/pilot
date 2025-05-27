import {
  WeaverseHydrogenRoot,
  type WeaverseLoaderData,
} from "@weaverse/hydrogen";
import { GenericError } from "~/components/root/generic-error";
import { components } from "./components";

export function WeaverseContent() {
  return (
    <WeaverseHydrogenRoot
      components={components}
      errorComponent={GenericError}
    />
  );
}

export function validateWeaverseData(weaverseData: WeaverseLoaderData) {
  if (
    !weaverseData?.page?.id ||
    (weaverseData?.page?.id?.includes("fallback") &&
      !weaverseData?.configs?.requestInfo?.queries?.isDesignMode)
  ) {
    throw new Response(null, { status: 404 });
  }
}
