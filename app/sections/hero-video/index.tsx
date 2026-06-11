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

  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playing, setPlaying] = useState(autoplay !== false);
  const [hovered, setHovered] = useState(false);
  const [hideContent, setHideContent] = useState(false);

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

  const sectionHeight = SECTION_HEIGHTS[height] || `${heightOnDesktop}px`;
  const sectionStyle: CSSProperties = {
    "--section-height": sectionHeight,
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
   * Force muted + inline playback on the lazily-mounted <video> — required for
   * iOS to autoplay inline rather than going fullscreen. react-player mounts
   * the element asynchronously, so poll briefly until it appears. No height is
   * measured here: the container size is fixed in CSS and the video just covers
   * it (`object-cover`), so there is no measure→resize feedback loop.
   */
  useEffect(() => {
    if (!isBrowser || !inView || !containerRef.current) {
      return;
    }
    const container = containerRef.current;
    let pollId: ReturnType<typeof setInterval> | null = null;
    let attempts = 0;

    function configure() {
      const mediaEl = container.querySelector("video");
      if (!mediaEl) {
        // Lazy player chunk / iframe embed not a <video> — retry briefly.
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

    pollId = setInterval(configure, 100);
    configure();

    return () => {
      if (pollId) {
        clearInterval(pollId);
      }
    };
  }, [inView, playing, loop]);

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
          // Full-bleed hero band: full width, fixed height. `container-type:size`
          // exposes the box to container-query units so the player below can
          // scale itself to cover the band (see its inline style).
          "relative w-full overflow-hidden h-(--section-height) @container-size",
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
              controls={false}
              // Cover the band for ANY source. `object-fit: cover` only crops
              // native <video>; YouTube/Vimeo render an <iframe> in shadow DOM
              // that ignores it, so we instead size the player to the smallest
              // 16:9 box that still covers the container, then center it (the
              // band's `overflow-hidden` crops the excess). cqw/cqh resolve
              // against the band's own width/height.
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "max(100cqw, calc(100cqh * 16 / 9))",
                height: "max(100cqh, calc(100cqw * 9 / 16))",
                objectFit: "cover",
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
