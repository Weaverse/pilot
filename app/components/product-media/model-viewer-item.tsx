import { ModelViewer } from "@shopify/hydrogen";
import type { getModel3dData } from "./model-utils";

type Model3dData = ReturnType<typeof getModel3dData>["data"];

export function ModelViewerItem({
  data,
  iosSrc,
  loading,
  reveal,
  className,
}: {
  data: Model3dData;
  iosSrc?: string;
  loading?: "auto" | "lazy" | "eager";
  // "interaction" is a valid runtime value but not in @google/model-viewer v1.12.1 types
  reveal?: "auto" | "manual" | "interaction";
  className?: string;
}) {
  return (
    <ModelViewer
      data={data}
      iosSrc={iosSrc}
      loading={loading}
      reveal={reveal as any}
      className={className}
    />
  );
}
