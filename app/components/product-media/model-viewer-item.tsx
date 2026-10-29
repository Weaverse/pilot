import type { getModel3dData } from "./model-utils";
import { ModelViewer } from "./model-viewer";

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
  reveal?: "auto" | "manual" | "interaction";
  className?: string;
}) {
  return (
    <ModelViewer
      data={data}
      iosSrc={iosSrc}
      loading={loading}
      reveal={reveal}
      className={className}
    />
  );
}
