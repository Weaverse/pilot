import { CubeIcon, VideoCameraIcon } from "@phosphor-icons/react";
import { ExternalVideo } from "@shopify/hydrogen";
import { lazy, Suspense } from "react";
import { preload } from "react-dom";
import type {
  Media_ExternalVideo_Fragment,
  Media_MediaImage_Fragment,
  Media_Model3d_Fragment,
  Media_Video_Fragment,
  MediaFragment,
} from "storefront-api.generated";
import { Image } from "~/components/image";
import type { ImageAspectRatio } from "~/types/others";
import { cn } from "~/utils/cn";
import { calculateAspectRatio } from "~/utils/image";
import { getModel3dData } from "./model-utils";

let LazyModelViewerItem = lazy(() =>
  import("./model-viewer-item").then((m) => ({ default: m.ModelViewerItem })),
);

export function MediaItem({
  media,
  imageAspectRatio,
  index,
  className,
  sizes = "(min-width: 1024px) 50vw, 80vw",
}: {
  media: MediaFragment;
  imageAspectRatio: ImageAspectRatio;
  index: number;
  className?: string;
  sizes?: string;
}) {
  if (media.mediaContentType === "IMAGE") {
    const { image, alt } = media as Media_MediaImage_Fragment;
    return (
      <Image
        data={{ ...image, altText: alt || "Product image" }}
        loading={index === 0 ? "eager" : "lazy"}
        fetchPriority={index === 0 ? "high" : undefined}
        className={cn("h-auto w-full object-cover", className)}
        width={2048}
        aspectRatio={calculateAspectRatio(image, imageAspectRatio)}
        sizes={sizes}
      />
    );
  }
  if (media.mediaContentType === "VIDEO") {
    const mediaVideo = media as Media_Video_Fragment;
    const aspectRatio =
      imageAspectRatio === "adapt" ? undefined : imageAspectRatio;
    return (
      <div className={cn("relative", className)}>
        <video
          controls
          aria-label={mediaVideo.alt || "Product video"}
          className="h-auto max-h-[80vh] w-full bg-black object-contain"
          style={{ aspectRatio }}
          onError={console.error}
        >
          <track
            kind="captions"
            src={mediaVideo.sources[0].url}
            label="English"
            srcLang="en"
            default
          />
          <source src={mediaVideo.sources[0].url} type="video/mp4" />
        </video>
        <div className="absolute right-2 bottom-2 bg-gray-900 p-0.5 text-white">
          <VideoCameraIcon className="h-4 w-4" />
        </div>
      </div>
    );
  }
  if (media.mediaContentType === "MODEL_3D") {
    let model3d = media as Media_Model3d_Fragment;
    let { data, iosSrc } = getModel3dData(model3d);
    let aspectRatio =
      imageAspectRatio === "adapt" ? undefined : imageAspectRatio;
    let modelStyle = { aspectRatio, height: aspectRatio ? undefined : "500px" };

    // Preload the GLB asset for the hero model
    if (index === 0) {
      preload(data.sources[0].url, { as: "fetch", crossOrigin: "anonymous" });
    }

    return (
      <div className={cn("relative", className)} style={modelStyle}>
        <Suspense fallback={<div className="h-full w-full bg-gray-100" />}>
          <LazyModelViewerItem
            data={data}
            iosSrc={iosSrc}
            loading={index === 0 ? "eager" : "lazy"}
            reveal={index === 0 ? "auto" : "interaction"}
            className="h-full w-full"
          />
        </Suspense>
        <div className="absolute top-2 right-2 bg-gray-900 p-0.5 text-white">
          <CubeIcon className="size-6" />
        </div>
      </div>
    );
  }
  if (media.mediaContentType === "EXTERNAL_VIDEO") {
    let externalVideo = media as Media_ExternalVideo_Fragment;
    return (
      <ExternalVideo
        data={externalVideo}
        className={cn("aspect-video h-auto w-full", className)}
      />
    );
  }
  return null;
}
