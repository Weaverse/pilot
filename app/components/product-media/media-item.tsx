import type {
  Media_MediaImage_Fragment,
  Media_Video_Fragment,
  MediaFragment,
} from "storefront-api.generated";
import { Image } from "~/components/image";
import type { ImageAspectRatio } from "~/types/others";
import { cn } from "~/utils/cn";
import { calculateAspectRatio } from "~/utils/image";

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
  return null;
}
