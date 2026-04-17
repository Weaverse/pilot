import { PauseIcon, PlayIcon } from "@phosphor-icons/react";
import {
  type HydrogenComponentProps,
  isBrowser,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import type { CSSProperties } from "react";
import { lazy, Suspense, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import {
  Overlay,
  type OverlayProps,
} from "~/components/overlay";
import { ScrollReveal } from "~/components/scroll-reveal";

export { schema } from "./schema";

const SECTION_HEIGHTS = {
  small: {
    desktop: "40vh",
    mobile: "50vh",
  },
  medium: {
    desktop: "50vh",
    mobile: "60vh",
  },
  large: {
    desktop: "70vh",
    mobile: "80vh",
  },
  custom: null,
};

export interface HeroVideoData
  extends OverlayProps,
    VariantProps<typeof variants> {
  videoURL: string;
  autoplay: boolean;
  loop: boolean;
  showPlayPauseButton: boolean;
  height: "small" | "medium" | "large" | "custom";
  heightOnDesktop: number;
  heightOnMobile: number;
}

export interface HeroVideoProps
  extends HeroVideoData,
    HydrogenComponentProps {
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

const ReactPlayer = lazy(() => import("react-player/lazy"));

export default function HeroVideo(props: HeroVideoProps) {
  const {
    ref,
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
    heightOnMobile,
    enableOverlay,
    overlayColor,
    overlayColorHover,
    overlayOpacity,
    children,
    ...rest
  } = props;

  const id = rest["data-wv-id"];
  const [size, setSize] = useState(() => getPlayerSize(id));
  const [playing, setPlaying] = useState(autoplay !== false);
  const [hovered, setHovered] = useState(false);

  let contentVisible = !hovered || !playing;

  function togglePlaying() {
    setPlaying((prev) => !prev);
  }

  const desktopHeight =
    SECTION_HEIGHTS[height]?.desktop || `${heightOnDesktop}px`;
  const mobileHeight = SECTION_HEIGHTS[height]?.mobile || `${heightOnMobile}px`;
  const sectionStyle: CSSProperties = {
    "--desktop-height": desktopHeight,
    "--mobile-height": mobileHeight,
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

  function handleResize() {
    setSize(getPlayerSize(id));
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation> --- IGNORE ---
  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [inView, height, heightOnDesktop, heightOnMobile]);

  return (
    <ScrollReveal
      as="section"
      ref={setRefs}
      {...rest}
      className="h-full w-full overflow-hidden"
      style={sectionStyle}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={clsx(
          "relative flex items-center justify-center overflow-hidden",
          "h-(--mobile-height) sm:h-(--desktop-height)",
          "w-[max(var(--mobile-height)/9*16,100vw)] sm:w-[max(var(--desktop-height)/9*16,100vw)]",
          "translate-x-[min(0px,calc((var(--mobile-height)/9*16-100vw)/-2))]",
          "sm:translate-x-[min(0px,calc((var(--desktop-height)/9*16-100vw)/-2))]",
        )}
      >
        {inView && (
          <Suspense fallback={null}>
            <ReactPlayer
              url={videoURL}
              playing={playing}
              muted
              loop={loop !== false}
              width={size.width}
              height={size.height}
              controls={false}
              className="aspect-video"
            />
          </Suspense>
        )}
        <Overlay
          enableOverlay={enableOverlay}
          overlayColor={overlayColor}
          overlayColorHover={overlayColorHover}
          overlayOpacity={contentVisible ? overlayOpacity : 0}
          className="z-0 transition-all"
        />
        <div
          className={clsx(
            variants({ gap, width, verticalPadding, contentPosition }),
            "transition-opacity duration-300",
            contentVisible ? "opacity-100" : "opacity-0",
          )}
        >
          {children}
        </div>
        {showPlayPauseButton !== false && (
          <button
            type="button"
            onClick={togglePlaying}
            className="absolute right-6 bottom-6 z-20 flex p-3 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            aria-label={playing ? "Pause video" : "Play video"}
          >
            {playing ? (
              <PauseIcon className="size-6" />
            ) : (
              <PlayIcon className="size-6" />
            )}
          </button>
        )}
      </div>
    </ScrollReveal>
  );
}
