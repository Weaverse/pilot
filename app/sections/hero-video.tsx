import {
  type HydrogenComponentProps,
  type HydrogenComponentSchema,
  isBrowser,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import type { CSSProperties } from "react";
import {
  Suspense,
  forwardRef,
  lazy,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useInView } from "react-intersection-observer";
import type { OverlayProps } from "~/components/overlay";
import { Overlay, overlayInputs } from "~/components/overlay";
import { useAnimation } from "~/hooks/use-animation";

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

export interface HeroVideoProps
  extends Omit<VariantProps<typeof variants>, "padding">,
    HydrogenComponentProps,
    OverlayProps {
  videoURL: string;
  height: "small" | "medium" | "large" | "custom";
  heightOnDesktop: number;
  heightOnMobile: number;
}

let variants = cva(
  "absolute inset-0 max-w-[100vw] mx-auto px-3 flex flex-col justify-center items-center z-10",
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
    },
    defaultVariants: {
      gap: 20,
    },
  },
);

let ReactPlayer = lazy(() => import("react-player/lazy"));

function getPlayerSize(id: string) {
  if (isBrowser) {
    let section = document.querySelector(`[data-wv-id="${id}"]`);
    if (section) {
      let rect = section.getBoundingClientRect();
      let aspectRatio = rect.width / rect.height;
      if (aspectRatio < 16 / 9) {
        return { width: "auto", height: "100%" };
      }
    }
  }
  return { width: "100%", height: "auto" };
}

let HeroVideo = forwardRef<HTMLElement, HeroVideoProps>((props, ref) => {
  let {
    videoURL,
    gap,
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

  let id = rest["data-wv-id"];
  let [size, setSize] = useState(() => getPlayerSize(id));

  let desktopHeight =
    SECTION_HEIGHTS[height]?.desktop || `${heightOnDesktop}px`;
  let mobileHeight = SECTION_HEIGHTS[height]?.mobile || `${heightOnMobile}px`;
  let sectionStyle: CSSProperties = {
    "--desktop-height": desktopHeight,
    "--mobile-height": mobileHeight,
  } as CSSProperties;

  let { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
  });

  // Use `useCallback` so we don't recreate the function on each render
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  let setRefs = useCallback(
    (node: HTMLElement) => {
      // Ref's from useRef needs to have the node assigned to `current`
      ref && Object.assign(ref, { current: node });
      // Callback refs, like the one from `useInView`, is a function that takes the node as an argument
      inViewRef(node);
    },
    [inViewRef],
  );

  function handleResize() {
    setSize(getPlayerSize(id));
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [inView, height, heightOnDesktop, heightOnMobile]);

  let [scope] = useAnimation();

  return (
    <section
      ref={setRefs}
      {...rest}
      className="overflow-hidden w-full h-full"
      style={sectionStyle}
    >
      <div
        className={clsx(
          "flex items-center justify-center relative overflow-hidden",
          "h-[var(--mobile-height)] sm:h-[var(--desktop-height)]",
          "w-[max(var(--mobile-height)/9*16,100vw)] sm:w-[max(var(--desktop-height)/9*16,100vw)]",
          "translate-x-[min(0px,calc((var(--mobile-height)/9*16-100vw)/-2))] sm:translate-x-[min(0px,calc((var(--desktop-height)/9*16-100vw)/-2))]",
        )}
      >
        {inView && (
          <Suspense fallback={null}>
            <ReactPlayer
              url={videoURL}
              playing
              muted
              loop={true}
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
          overlayOpacity={overlayOpacity}
          className="z-0"
        />
        <div ref={scope} className={clsx(variants({ gap }))}>
          {children}
        </div>
      </div>
    </section>
  );
});

export default HeroVideo;

export let schema: HydrogenComponentSchema = {
  type: "hero-video",
  title: "Hero video",
  inspector: [
    {
      group: "Video",
      inputs: [
        {
          type: "text",
          name: "videoURL",
          label: "Video URL",
          defaultValue: "https://www.youtube.com/watch?v=Su-x4Mo5xmU",
          placeholder: "https://www.youtube.com/watch?v=Su-x4Mo5xmU",
          helpText: "Support YouTube, Vimeo, MP4, WebM, and HLS streams.",
        },
        {
          type: "heading",
          label: "Layout",
        },
        {
          type: "select",
          name: "height",
          label: "Section height",
          configs: {
            options: [
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
              { value: "custom", label: "Custom" },
            ],
          },
          defaultValue: "medium",
        },
        {
          type: "range",
          name: "heightOnDesktop",
          label: "Height on desktop",
          defaultValue: 650,
          configs: {
            min: 400,
            max: 800,
            step: 10,
            unit: "px",
          },
          condition: "height.eq.custom",
        },
        {
          type: "range",
          name: "heightOnMobile",
          label: "Height on mobile",
          defaultValue: 300,
          configs: {
            min: 250,
            max: 500,
            step: 10,
            unit: "px",
          },
          condition: "height.eq.custom",
        },
        {
          type: "range",
          name: "gap",
          label: "Items spacing",
          configs: {
            min: 0,
            max: 40,
            step: 4,
            unit: "px",
          },
          defaultValue: 20,
        },
      ],
    },
    {
      group: "Overlay",
      inputs: overlayInputs,
    },
  ],
  childTypes: ["subheading", "heading", "paragraph", "button"],
  presets: {
    enableOverlay: true,
    overlayColor: "#000000",
    overlayOpacity: 40,
    videoURL: "https://www.youtube.com/watch?v=gbLmku5QACM",
    height: "large",
    gap: 20,
    children: [
      {
        type: "subheading",
        content: "Seamless hero videos",
        color: "#fff",
      },
      {
        type: "heading",
        content: "Bring your brand to life.",
        as: "h2",
        color: "#fff",
      },
      {
        type: "paragraph",
        content:
          "Pair large video with a compelling message to captivate your audience.",
        color: "#fff",
      },
    ],
  },
};
