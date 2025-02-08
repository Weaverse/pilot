import { ArrowLeft, ArrowRight, VideoCamera, X } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { parseGid } from "@shopify/hydrogen";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import type {
  MediaFragment,
  Media_MediaImage_Fragment,
  Media_Video_Fragment,
} from "storefront-api.generated";
import { Button } from "~/components/button";
import { Image } from "~/components/image";
import { ScrollArea } from "~/components/scroll-area";
import { cn } from "~/utils/cn";
import { getImageAspectRatio } from "~/utils/image";

export function ZoomModal({
  media,
  zoomMediaId,
  setZoomMediaId,
  open,
  onOpenChange,
}: {
  media: MediaFragment[];
  zoomMediaId: string;
  setZoomMediaId: (id: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  let scrollAreaRef = useRef<HTMLDivElement>(null);
  let zoomMedia = media.find((med) => med.id === zoomMediaId);
  let zoomMediaIndex = media.findIndex((med) => med.id === zoomMediaId);
  let nextMedia = media[zoomMediaIndex + 1] ?? media[0];
  let prevMedia = media[zoomMediaIndex - 1] ?? media[media.length - 1];

  function scrollToMedia(id: string) {
    let { id: mediaId } = parseGid(id);
    let mediaElement = document.getElementById(`zoom-media--${mediaId}`);
    if (mediaElement) {
      let isVisible = isVisibleInParent(mediaElement, scrollAreaRef.current);
      if (!isVisible) {
        mediaElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        setZoomMediaId(nextMedia.id);
        scrollToMedia(nextMedia.id);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        setZoomMediaId(prevMedia.id);
        scrollToMedia(prevMedia.id);
      }
    }
    if (open) {
      window.requestAnimationFrame(() => scrollToMedia(zoomMediaId));
      window.addEventListener("keydown", handleKeyDown);
    } else {
      window.removeEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, zoomMediaId, setZoomMediaId, nextMedia, prevMedia]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 bg-white data-[state=open]:animate-fade-in z-10"
          style={{ "--fade-in-duration": "100ms" } as React.CSSProperties}
        />
        <Dialog.Content
          className={clsx([
            "fixed inset-0 w-screen z-10",
            "data-[state=open]:animate-slide-up",
          ])}
          style={
            {
              "--slide-up-from": "20px",
              "--slide-up-duration": "300ms",
            } as React.CSSProperties
          }
          aria-describedby={undefined}
        >
          <div className="w-full h-full flex items-center justify-center bg-[--color-background] relative">
            <VisuallyHidden.Root asChild>
              <Dialog.Title>Product media zoom</Dialog.Title>
            </VisuallyHidden.Root>
            <div className="hidden md:block absolute top-10 left-8">
              <ScrollArea
                ref={scrollAreaRef}
                className="max-h-[700px]"
                size="sm"
              >
                <div className="w-24 pr-2 space-y-2">
                  {media.map(({ id, previewImage, alt, mediaContentType }) => {
                    let { id: mediaId } = parseGid(id);
                    return (
                      <div
                        key={id}
                        id={`zoom-media--${mediaId}`}
                        className={cn(
                          "relative bg-gray-100",
                          "p-1 border transition-colors cursor-pointer border-transparent !h-auto",
                          zoomMediaId === id && "border-line",
                        )}
                        onClick={() => setZoomMediaId(id)}
                      >
                        <Image
                          data={{
                            ...previewImage,
                            altText: alt || "Product image zoom",
                          }}
                          loading="lazy"
                          width={200}
                          aspectRatio="1/1"
                          className="object-cover w-full h-auto"
                          sizes="auto"
                        />
                        {mediaContentType === "VIDEO" && (
                          <div className="absolute bottom-2 right-2 bg-gray-900 text-white p-0.5">
                            <VideoCamera className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
            <ZoomMedia media={zoomMedia} />
            <Dialog.Close className="absolute top-4 right-4 z-1">
              <X className="w-6 h-6" />
            </Dialog.Close>
            <div className="flex items-center gap-2 justify-center absolute bottom-10 left-10 md:left-auto right-10">
              <Button
                variant="secondary"
                className="border-line-subtle"
                onClick={() => {
                  setZoomMediaId(prevMedia.id);
                  scrollToMedia(prevMedia.id);
                }}
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </Button>
              <Button
                variant="secondary"
                className="border-line-subtle"
                onClick={() => {
                  setZoomMediaId(nextMedia.id);
                  scrollToMedia(nextMedia.id);
                }}
              >
                <ArrowRight className="w-4.5 h-4.5" />
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ZoomMedia({ media }: { media: MediaFragment }) {
  if (!media) return null;
  if (media.mediaContentType === "IMAGE") {
    let { image, alt } = media as Media_MediaImage_Fragment;
    return (
      <Image
        data={{ ...image, altText: alt || "Product image zoom" }}
        loading="lazy"
        className="object-cover max-w-[95vw] w-auto h-auto md:h-full max-h-screen"
        width={4096}
        aspectRatio={getImageAspectRatio(image, "adapt")}
        sizes="auto"
      />
    );
  }
  if (media.mediaContentType === "VIDEO") {
    let mediaVideo = media as Media_Video_Fragment;
    return (
      <video controls className="h-auto md:h-full object-cover">
        <track kind="captions" />
        <source src={mediaVideo.sources[0].url} type="video/mp4" />
      </video>
    );
  }
  return null;
}

function isVisibleInParent(child: HTMLElement, parent: HTMLElement) {
  let childRect = child.getBoundingClientRect();
  let parentRect = parent.getBoundingClientRect();
  return (
    childRect.top >= parentRect.top &&
    childRect.bottom <= parentRect.bottom &&
    childRect.left >= parentRect.left &&
    childRect.right <= parentRect.right
  );
}
