import { ModelViewer } from "@shopify/hydrogen";
import type {
  Media_MediaImage_Fragment,
  Media_Model3d_Fragment,
  Media_Video_Fragment,
  MediaFragment,
} from "storefront-api.generated";
import { Image } from "~/components/image";
import type { ImageAspectRatio } from "~/types/others";
import { cn } from "~/utils/cn";
import { calculateAspectRatio } from "~/utils/image";

// --- DEBUG START ---
declare global {
  interface Window {
    __debug_logs: Array<Record<string, unknown>>;
  }
}
// --- DEBUG END ---

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
    const media3d = media as Media_Model3d_Fragment;
    // --- DEBUG START ---
    if (typeof window !== "undefined" && window.__debug_logs) {
      window.__debug_logs.push({
        timestamp: Date.now(),
        key: "media_item_model_3d_render",
        mediaId: media3d.id,
        alt: media3d.alt,
        sourcesCount: media3d.sources?.length,
        sources: media3d.sources?.map((s) => ({
          mimeType: s.mimeType,
          url: s.url.substring(0, 50) + "...",
        })),
        hasPreviewImage: !!media3d.previewImage,
      });
    }
    // --- DEBUG END ---
    return (
      <ModelViewer
        data={media3d}
        alt={media3d.alt || "3D model of product"}
        className={cn("h-[500px] w-full lg:h-[600px]", className)}
        onLoad={(event) => {
          // --- DEBUG START ---
          if (typeof window !== "undefined" && window.__debug_logs) {
            window.__debug_logs.push({
              timestamp: Date.now(),
              key: "model_viewer_loaded",
              mediaId: media3d.id,
              event: event.type,
            });
          }
          // --- DEBUG END ---
        }}
        onError={(event) => {
          // --- DEBUG START ---
          if (typeof window !== "undefined" && window.__debug_logs) {
            window.__debug_logs.push({
              timestamp: Date.now(),
              key: "model_viewer_error",
              mediaId: media3d.id,
              error: (event as ErrorEvent).message || "Unknown error",
            });
          }
          // --- DEBUG END ---
          console.error("[ModelViewer] Error:", event);
        }}
      />
    );
  }
  return null;
}
