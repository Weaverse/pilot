import { ExternalVideo, ModelViewer } from "@shopify/hydrogen";
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

export function MediaItem({
  media,
  imageAspectRatio,
  index,
  className,
}: {
  media: MediaFragment;
  imageAspectRatio: ImageAspectRatio;
  index: number;
  className?: string;
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
        sizes="auto"
      />
    );
  }
  if (media.mediaContentType === "VIDEO") {
    const mediaVideo = media as Media_Video_Fragment;
    const aspectRatio =
      imageAspectRatio === "adapt" ? undefined : imageAspectRatio;
    return (
      <video
        controls
        aria-label={mediaVideo.alt || "Product video"}
        className={cn(
          "h-auto max-h-[80vh] w-full bg-black object-contain",
          className,
        )}
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
    );
  }
  if (media.mediaContentType === "MODEL_3D") {
    let model3d = media as Media_Model3d_Fragment;
    let { data, iosSrc } = getModel3dData(model3d);
    let aspectRatio =
      imageAspectRatio === "adapt" ? undefined : imageAspectRatio;
    return (
      <ModelViewer
        data={data}
        iosSrc={iosSrc}
        className={cn("w-full", className)}
        style={{ aspectRatio, height: aspectRatio ? undefined : "500px" }}
      />
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
