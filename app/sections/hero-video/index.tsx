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

// react-player v3 is ESM-only and lazy-loads individual players internally,
// so a plain dynamic import resolves cleanly. React.lazy here only defers the
// player until the section scrolls into view.
const ReactPlayer = lazy(() => import("react-player"));

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

    if (mediaEl instanceof HTMLVideoElement) {
      mediaEl.muted = true;
      mediaEl.defaultMuted = true;
      mediaEl.playsInline = true;
      mediaEl.setAttribute("muted", "");
      mediaEl.setAttribute("playsinline", "");
      mediaEl.setAttribute("webkit-playsinline", "");

      if (playing) {
        mediaEl.autoplay = true;
        mediaEl.setAttribute("autoplay", "");
      }

      if (loop !== false) {
        mediaEl.loop = true;
        mediaEl.setAttribute("loop", "");
      }
    }

    if (mediaEl instanceof HTMLVideoElement) {
      // Derive height from the INTRINSIC video dimensions, never from the
      // rendered box: the container height is set from this value, and the
      // video fills the container, so committing a rendered measurement can
      // deadlock a wrong value (e.g. the 300x150 default before metadata
      // loads — observed as an intermittently squashed hero).
      if (mediaEl.videoWidth > 0 && mediaEl.videoHeight > 0) {
        const containerWidth =
          containerRef.current.getBoundingClientRect().width;
        const intrinsicHeight =
          (containerWidth * mediaEl.videoHeight) / mediaEl.videoWidth;
        commitVideoHeight(intrinsicHeight);
      }
      // Metadata not loaded yet — skip; loadedmetadata/ResizeObserver will
      // re-trigger this sync.
      return;
    }
    if (mediaEl) {
      // Iframe embeds (YouTube/Vimeo) size themselves via aspect-ratio
      // styles — the rendered box is the only available signal.
      const actualHeight = mediaEl.getBoundingClientRect().height;
      if (actualHeight > 0) {
        commitVideoHeight(actualHeight);
      }
    }
  }
  function commitVideoHeight(next: number) {
    // Only update if significantly different (> 2px) to avoid jitter
    setVideoHeight((prev) => {
      if (prev === null || Math.abs(prev - next) > 2) {
        return next;
      }
      return prev;
    });
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
  /**
   * A single post-mount measurement is a race: if it lands before the video
   * metadata loads, the <video> element reports the browser default 300x150
   * and the container gets locked at ~150px (intermittent squashed hero).
   * Watch for the media element (react-player mounts lazily) and keep the
   * container in sync with a ResizeObserver — metadata load, player chrome,
   * and breakpoint changes all resize the element and re-trigger the sync.
   */
  function watchMediaElement(): (() => void) | undefined {
    if (!isBrowser || !containerRef.current) {
      return undefined;
    }
    let observer: ResizeObserver | null = null;
    let pollId: ReturnType<typeof setInterval> | null = null;
    let attempts = 0;
    const attach = () => {
      const mediaEl = containerRef.current?.querySelector("video, iframe");
      if (!mediaEl) {
        // Lazy player chunk not mounted yet — retry briefly.
        attempts += 1;
        if (attempts > 100 && pollId) {
          clearInterval(pollId);
        }
        return;
      }
      if (pollId) {
        clearInterval(pollId);
        pollId = null;
      }
      syncVideoHeight();
      observer = new ResizeObserver(() => syncVideoHeight());
      observer.observe(mediaEl);
      if (mediaEl instanceof HTMLVideoElement) {
        mediaEl.addEventListener("loadedmetadata", syncVideoHeight);
      }
    };
    pollId = setInterval(attach, 100);
    attach();
    return () => {
      if (pollId) {
        clearInterval(pollId);
      }
      observer?.disconnect();
    };
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
    const stopWatching = inView ? watchMediaElement() : undefined;
    return () => {
      window.removeEventListener("resize", handleResize);
      stopWatching?.();
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
              src={video?.url || videoURL}
              playing={playing}
              autoPlay={playing}
              muted
              loop={loop !== false}
              playsInline
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
