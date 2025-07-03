import {
  ArrowLeftIcon,
  ArrowRightIcon,
  VideoCameraIcon,
  XIcon,
} from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { parseGid } from "@shopify/hydrogen";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import type {
  Media_MediaImage_Fragment,
  Media_Video_Fragment,
  MediaFragment,
} from "storefront-api.generated";
import { Button } from "~/components/button";
import { Image } from "~/components/image";
import { ScrollArea } from "~/components/scroll-area";
import { cn } from "~/utils/cn";
import { calculateAspectRatio } from "~/utils/image";

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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const zoomMedia = media.find((med) => med.id === zoomMediaId);
  const zoomMediaIndex = media.findIndex((med) => med.id === zoomMediaId);
  const nextMedia = media[zoomMediaIndex + 1] ?? media[0];
  const prevMedia = media[zoomMediaIndex - 1] ?? media[media.length - 1];

  function scrollToMedia(id: string) {
    const { id: mediaId } = parseGid(id);
    const mediaElement = document.getElementById(`zoom-media--${mediaId}`);
    if (mediaElement) {
      const isVisible = isVisibleInParent(mediaElement, scrollAreaRef.current);
      if (!isVisible) {
        mediaElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation> --- IGNORE ---
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
          className="fixed inset-0 z-10 bg-white data-[state=open]:animate-fade-in"
          style={{ "--fade-in-duration": "100ms" } as React.CSSProperties}
        />
        <Dialog.Content
          className={clsx([
            "fixed inset-0 z-10 w-screen",
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
          <div className="relative flex h-full w-full items-center justify-center bg-(--color-background)">
            <VisuallyHidden.Root asChild>
              <Dialog.Title>Product media zoom</Dialog.Title>
            </VisuallyHidden.Root>
            <div className="absolute top-10 left-8 hidden md:block">
              <ScrollArea
                ref={scrollAreaRef}
                className="max-h-[700px]"
                size="sm"
              >
                <div className="w-24 space-y-2 pr-2">
                  {media.map(({ id, previewImage, alt, mediaContentType }) => {
                    const { id: mediaId } = parseGid(id);
                    return (
                      <div
                        key={id}
                        id={`zoom-media--${mediaId}`}
                        className={cn(
                          "relative bg-gray-100",
                          "h-auto! cursor-pointer border border-transparent p-1 transition-colors",
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
                          className="h-auto w-full object-cover"
                          sizes="auto"
                        />
                        {mediaContentType === "VIDEO" && (
                          <div className="absolute right-2 bottom-2 bg-gray-900 p-0.5 text-white">
                            <VideoCameraIcon className="h-4 w-4" />
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
              <XIcon className="h-6 w-6" />
            </Dialog.Close>
            <div className="absolute right-10 bottom-10 left-10 flex items-center justify-center gap-2 md:left-auto">
              <Button
                variant="secondary"
                className="border-line-subtle"
                onClick={() => {
                  setZoomMediaId(prevMedia.id);
                  scrollToMedia(prevMedia.id);
                }}
              >
                <ArrowLeftIcon className="h-4.5 w-4.5" />
              </Button>
              <Button
                variant="secondary"
                className="border-line-subtle"
                onClick={() => {
                  setZoomMediaId(nextMedia.id);
                  scrollToMedia(nextMedia.id);
                }}
              >
                <ArrowRightIcon className="h-4.5 w-4.5" />
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
    const { image, alt } = media as Media_MediaImage_Fragment;
    return (
      <Image
        data={{ ...image, altText: alt || "Product image zoom" }}
        loading="lazy"
        className="h-auto max-h-screen-no-topbar w-auto max-w-[95vw] object-cover md:h-full"
        width={4096}
        aspectRatio={calculateAspectRatio(image, "adapt")}
        sizes="auto"
      />
    );
  }
  if (media.mediaContentType === "VIDEO") {
    const mediaVideo = media as Media_Video_Fragment;
    return (
      <video controls className="h-auto object-cover md:h-full">
        <track kind="captions" />
        <source src={mediaVideo.sources[0].url} type="video/mp4" />
      </video>
    );
  }
  return null;
}

function isVisibleInParent(child: HTMLElement, parent: HTMLElement) {
  const childRect = child.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();
  return (
    childRect.top >= parentRect.top &&
    childRect.bottom <= parentRect.bottom &&
    childRect.left >= parentRect.left &&
    childRect.right <= parentRect.right
  );
}
