import { PauseIcon, PlayIcon } from "@phosphor-icons/react";
import {
  type HydrogenComponentProps,
  isBrowser,
  type WeaverseVideo,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import type { CSSProperties } from "react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Overlay, type OverlayProps } from "~/components/overlay";
import { ScrollReveal } from "~/components/scroll-reveal";

export { schema } from "./schema";

const SECTION_HEIGHTS = {
  small: "40vh",
  medium: "50vh",
  large: "70vh",
  custom: null,
};

export interface HeroVideoData
  extends OverlayProps,
    VariantProps<typeof variants> {
  video: WeaverseVideo;
  videoURL: string;
  autoplay: boolean;
  loop: boolean;
  showPlayPauseButton: boolean;
  height: "small" | "medium" | "large" | "custom";
  heightOnDesktop: number;
}

export interface HeroVideoProps extends HeroVideoData, HydrogenComponentProps {
  ref: React.Ref<HTMLElement>;
}

export const variants = cva(
  "absolute inset-0 z-10 mx-auto flex max-w-screen flex-col px-3 [&_.paragraph]:mx-[unset]",
  {
    variants: {
      gap: {
        0: "",
        4: "space-y-1",
        8: "space-y-2",
        12: "space-y-3",
        16: "space-y-4",
        20: "space-y-5",
        24: "space-y-3 lg:space-y-6",
        28: "space-y-3.5 lg:space-y-7",
        32: "space-y-4 lg:space-y-8",
        36: "space-y-4 lg:space-y-9",
        40: "space-y-5 lg:space-y-10",
        44: "space-y-5 lg:space-y-11",
        48: "space-y-6 lg:space-y-12",
        52: "space-y-6 lg:space-y-[52px]",
        56: "space-y-7 lg:space-y-14",
        60: "space-y-7 lg:space-y-[60px]",
      },
      width: {
        full: "w-full",
        stretch: "w-full px-3 md:px-10 lg:px-16",
        fixed: "w-full max-w-(--page-width) px-3 md:px-4 lg:px-6",
      },
      verticalPadding: {
        none: "",
        small: "py-4 md:py-6 lg:py-8",
        medium: "py-8 md:py-12 lg:py-16",
        large: "py-12 md:py-24 lg:py-32",
      },
      contentPosition: {
        "top left": "items-start justify-start [&_.paragraph]:text-left",
        "top center": "items-center justify-start [&_.paragraph]:text-center",
        "top right": "items-end justify-start [&_.paragraph]:text-right",
        "center left": "items-start justify-center [&_.paragraph]:text-left",
        "center center":
          "items-center justify-center [&_.paragraph]:text-center",
        "center right": "items-end justify-center [&_.paragraph]:text-right",
        "bottom left": "items-start justify-end [&_.paragraph]:text-left",
        "bottom center": "items-center justify-end [&_.paragraph]:text-center",
        "bottom right": "items-end justify-end [&_.paragraph]:text-right",
      },
    },
    defaultVariants: {
      gap: 20,
      contentPosition: "center center",
    },
  },
);

function getPlayerSize(id: string) {
  if (isBrowser) {
    const section = document.querySelector(`[data-wv-id="${id}"]`);
    if (section) {
      const rect = section.getBoundingClientRect();
      const aspectRatio = rect.width / rect.height;
      if (aspectRatio < 16 / 9) {
        return { width: "auto", height: "100%" };
      }
    }
  }
  return { width: "100%", height: "auto" };
}

/**
 * Calculate expected video height based on intrinsic dimensions and container width.
 * This avoids layout shift by setting the correct height before the video renders.
 */
function calculateVideoHeight(
  video: WeaverseVideo | undefined,
  containerWidth: number,
): number | null {
  // Use WeaverseVideo intrinsic dimensions if available
  if (video?.width && video?.height && containerWidth > 0) {
    const aspectRatio = video.width / video.height;
    return containerWidth / aspectRatio;
  }
  return null;
}

const ReactPlayer = lazy(() => import("react-player/lazy"));

export default function HeroVideo(props: HeroVideoProps) {
  const {
    ref,
    video,
    videoURL,
    autoplay,
    loop,
    showPlayPauseButton,
    gap,
    width,
    verticalPadding,
    contentPosition,
    height,
    heightOnDesktop,
    enableOverlay,
    overlayColor,
    overlayColorHover,
    overlayOpacity,
    children,
    ...rest
  } = props;

  const id = rest["data-wv-id"];
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(() => getPlayerSize(id));
  const [playing, setPlaying] = useState(autoplay !== false);
  const [hovered, setHovered] = useState(false);

  // Calculate initial video height from intrinsic dimensions
  const [videoHeight, setVideoHeight] = useState<number | null>(() => {
    if (isBrowser && containerRef.current) {
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      return calculateVideoHeight(video, containerWidth);
    }
    // Fallback: calculate from video metadata if available
    if (isBrowser && video?.width && video?.height) {
      // Use viewport width as estimate for container width
      const estimatedWidth = window.innerWidth;
      return calculateVideoHeight(video, estimatedWidth);
    }
    return null;
  });

  let contentVisible = !hovered || !playing;

  function togglePlaying() {
    setPlaying((prev) => !prev);
  }

  const desktopHeight = SECTION_HEIGHTS[height] || `${heightOnDesktop}px`;
  const sectionStyle: CSSProperties = {
    "--desktop-height": desktopHeight,
    ...(videoHeight ? { "--video-height": `${videoHeight}px` } : {}),
  } as CSSProperties;

  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
  });

  const setRefs = (node: HTMLElement) => {
    inViewRef(node);
    if (typeof ref === "function") {
      ref(node);
    } else if (ref && "current" in ref) {
      ref.current = node;
    }
  };

  /**
   * Measure actual video element height and adjust container to match.
   * This corrects any discrepancy between calculated and actual rendered height.
   */
  function syncVideoHeight() {
    if (!containerRef.current) {
      return;
    }

    // Find the actual video or iframe element inside ReactPlayer
    const mediaEl = containerRef.current.querySelector(
      "video, iframe",
    ) as HTMLElement | null;

    if (mediaEl) {
      const actualHeight = mediaEl.getBoundingClientRect().height;
      if (actualHeight > 0) {
        // Only update if significantly different (> 2px) to avoid jitter
        setVideoHeight((prev) => {
          if (prev === null || Math.abs(prev - actualHeight) > 2) {
            return actualHeight;
          }
          return prev;
        });
      }
    }
  }

  /**
   * Recalculate video height on resize using intrinsic dimensions.
   * This ensures the container always matches the video's actual displayed size.
   */
  function handleResize() {
    setSize(getPlayerSize(id));

    // First, try intrinsic calculation
    if (containerRef.current && video?.width && video?.height) {
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      const calculatedHeight = calculateVideoHeight(video, containerWidth);
      if (calculatedHeight) {
        setVideoHeight(calculatedHeight);
      }
    }

    // Then sync with actual video element after a brief delay
    requestAnimationFrame(syncVideoHeight);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation> --- IGNORE ---
  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [inView, height, heightOnDesktop]);

  return (
    <ScrollReveal
      as="section"
      ref={setRefs}
      {...rest}
      className="relative h-full w-full overflow-hidden"
      style={sectionStyle}
    >
      <div
        ref={containerRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={clsx(
          "relative flex items-center justify-center overflow-hidden w-full",
          videoHeight
            ? "h-(--video-height) md:h-[min(var(--desktop-height),var(--video-height))]"
            : "aspect-video md:aspect-auto md:h-(--desktop-height)",
          "md:w-[max(var(--desktop-height)/9*16,100vw)]",
          "md:translate-x-[min(0px,calc((var(--desktop-height)/9*16-100vw)/-2))]",
        )}
      >
        {inView && (
          <Suspense fallback={null}>
            <ReactPlayer
              url={video?.url || videoURL}
              playing={playing}
              muted
              loop={loop !== false}
              width={size.width}
              height={size.height}
              controls={false}
              // className="aspect-video"
              onReady={() => {
                // Sync container height with actual video element after render
                requestAnimationFrame(syncVideoHeight);
              }}
            />
          </Suspense>
        )}
        <Overlay
          enableOverlay={enableOverlay}
          overlayColor={overlayColor}
          overlayColorHover={overlayColorHover}
          overlayOpacity={contentVisible ? overlayOpacity : 0}
          className="z-0 hidden transition-all md:block"
        />
        <div
          className={clsx(
            variants({ gap, width, verticalPadding, contentPosition }),
            "hidden transition-opacity duration-300 md:flex",
            contentVisible ? "opacity-100" : "opacity-0",
          )}
        >
          {children}
        </div>
      </div>
      {showPlayPauseButton !== false && (
        <button
          type="button"
          onClick={togglePlaying}
          className="absolute right-4 bottom-4 z-20 flex p-3 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
          aria-label={playing ? "Pause video" : "Play video"}
        >
          {playing ? (
            <PauseIcon className="size-6" />
          ) : (
            <PlayIcon className="size-6" />
          )}
        </button>
      )}
    </ScrollReveal>
  );
}
