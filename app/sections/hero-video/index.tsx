import { PauseIcon, PlayIcon } from "@phosphor-icons/react";
import { isBrowser } from "@weaverse/hydrogen";
import clsx from "clsx";
import type { CSSProperties } from "react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Overlay } from "~/components/overlay";
import { ScrollReveal } from "~/components/scroll-reveal";
import { variants } from "./styles";
import { type HeroVideoProps, SECTION_HEIGHTS } from "./types";
import { calculateVideoHeight, getPlayerSize } from "./utils";

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
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [size, setSize] = useState(() => getPlayerSize(id));
  const [playing, setPlaying] = useState(autoplay !== false);
  const [hovered, setHovered] = useState(false);
  const [hideContent, setHideContent] = useState(false);

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

  // Content visible when: paused, or not hovered, or not hidden by delay
  let contentVisible = !playing || !hovered || !hideContent;

  function togglePlaying() {
    setPlaying((prev) => !prev);
  }

  function handleMouseEnter() {
    setHovered(true);
    // Delay before hiding content (1.5 seconds)
    hoverTimeoutRef.current = setTimeout(() => {
      setHideContent(true);
    }, 1500);
  }

  function handleMouseLeave() {
    setHovered(false);
    // Cancel delayed hide and show content immediately
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHideContent(false);
  }

  const desktopHeight = SECTION_HEIGHTS[height] || `${heightOnDesktop}px`;
  const sectionStyle: CSSProperties = {
    "--desktop-height": desktopHeight,
    ...(videoHeight ? { "--video-height": `${videoHeight}px` } : {}),
    "--gap-desktop": `${gap ?? 0}px`,
    "--gap-mobile": (gap ?? 0) <= 20 ? `${gap ?? 0}px` : `${(gap ?? 0) / 2}px`,
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

  // Reset hideContent when video is paused (show content immediately)
  useEffect(() => {
    if (!playing) {
      setHideContent(false);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
    }
  }, [playing]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

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
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
            variants({ width, verticalPadding, contentPosition }),
            "space-y-(--gap-mobile) lg:space-y-(--gap-desktop)",
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

export { schema } from "./schema";
