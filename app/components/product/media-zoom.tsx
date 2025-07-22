import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MagnifyingGlassPlusIcon,
  VideoCameraIcon,
  XIcon,
} from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { parseGid } from "@shopify/hydrogen";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import type {
  Media_MediaImage_Fragment,
  Media_Video_Fragment,
  MediaFragment,
} from "storefront-api.generated";
import { Button } from "~/components/button";
import { Image } from "~/components/image";
import { ScrollArea } from "~/components/scroll-area";
import { Spinner } from "~/components/spinner";
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
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [previousMediaId, setPreviousMediaId] = useState(zoomMediaId);

  const zoomMedia = media.find((med) => med.id === zoomMediaId);
  const zoomMediaIndex = media.findIndex((med) => med.id === zoomMediaId);
  const nextMedia = media[zoomMediaIndex + 1] ?? media[0];
  const prevMedia = media[zoomMediaIndex - 1] ?? media.at(-1);

  // Handle loading state when media changes
  useEffect(() => {
    if (zoomMediaId !== previousMediaId) {
      const currentMedia = media.find((med) => med.id === zoomMediaId);
      if (currentMedia?.mediaContentType === "IMAGE") {
        const imageMedia = currentMedia as Media_MediaImage_Fragment;
        const previousMedia = media.find((med) => med.id === previousMediaId);
        const previousImageUrl =
          previousMedia?.mediaContentType === "IMAGE"
            ? (previousMedia as Media_MediaImage_Fragment).image?.url
            : null;

        // Only show loading if switching to a different image
        if (imageMedia.image?.url !== previousImageUrl) {
          setIsImageLoading(true);
        }
      } else {
        setIsImageLoading(false);
      }
      setPreviousMediaId(zoomMediaId);
    }
  }, [zoomMediaId, previousMediaId, media]);

  function scrollToMedia(id: string) {
    const { id: mediaId } = parseGid(id);
    const mediaElement = document.getElementById(`zoom-media--${mediaId}`);
    if (mediaElement && scrollAreaRef.current) {
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
            <div className="absolute top-10 left-8 hidden lg:block">
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
            <div className="relative">
              {isImageLoading && <Spinner />}
              <ZoomMedia
                media={zoomMedia}
                onImageLoad={() => setIsImageLoading(false)}
              />
            </div>
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

function ZoomMedia({
  media,
  onImageLoad,
}: {
  media: MediaFragment | undefined;
  onImageLoad?: () => void;
}) {
  if (!media) {
    return null;
  }
  if (media.mediaContentType === "IMAGE") {
    const { image, alt } = media as Media_MediaImage_Fragment;
    return (
      <Image
        data={{ ...image, altText: alt || "Product image zoom" }}
        loading="lazy"
        className="h-auto w-auto object-cover md:h-full lg:max-w-[calc(100vw-16rem)] [&>img]:max-h-screen"
        width={4096}
        aspectRatio={calculateAspectRatio(image, "adapt")}
        sizes="auto"
        onLoad={onImageLoad}
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

export interface ZoomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function ZoomButton({ className, ...props }: ZoomButtonProps) {
  return (
    <button
      type="button"
      className={clsx(
        "rounded-full border border-transparent p-2 text-center",
        "transition-all duration-200",
        "bg-white text-gray-900 hover:bg-gray-800 hover:text-white",
        className,
      )}
      aria-label="Zoom product media"
      {...props}
    >
      <MagnifyingGlassPlusIcon className="h-5 w-5" />
    </button>
  );
}
