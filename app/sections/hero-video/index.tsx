import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from "@weaverse/hydrogen";
import clsx from "clsx";
import type { CSSProperties } from "react";
import { Suspense, forwardRef, lazy } from "react";
import type { OverlayProps } from "~/components/Overlay";
import { Overlay, overlayInputs } from "~/components/Overlay";
import { gapClasses } from "~/components/Section";

type HeroVideoProps = OverlayProps & {
  videoURL: string;
  sectionHeightDesktop: number;
  sectionHeightMobile: number;
  gap: number;
};

let ReactPlayer = lazy(() => import("react-player/lazy"));

let HeroVideo = forwardRef<
  HTMLElement,
  HeroVideoProps & HydrogenComponentProps
>((props, ref) => {
  let {
    videoURL,
    gap,
    sectionHeightDesktop,
    sectionHeightMobile,
    enableOverlay,
    overlayColor,
    overlayOpacity,
    children,
    ...rest
  } = props;
  let sectionStyle: CSSProperties = {
    "--desktop-height": `${sectionHeightDesktop}px`,
    "--mobile-height": `${sectionHeightMobile}px`,
  } as CSSProperties;

  return (
    <section
      ref={ref}
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
        <Suspense fallback={null}>
          <ReactPlayer
            url={videoURL}
            playing
            muted
            loop={true}
            width="100%"
            height="auto"
            controls={false}
            className="aspect-video"
          />
        </Suspense>
        <Overlay
          enableOverlay={enableOverlay}
          overlayColor={overlayColor}
          overlayOpacity={overlayOpacity}
          className="z-0"
        />
        <div
          className={clsx(
            "absolute inset-0 max-w-[100vw] mx-auto px-3 flex flex-col justify-center items-center z-10",
            gapClasses[gap],
          )}
        >
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
  toolbar: ["general-settings", ["duplicate", "delete"]],
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
          type: "range",
          name: "sectionHeightDesktop",
          label: "Height on desktop",
          defaultValue: 650,
          configs: {
            min: 400,
            max: 800,
            step: 10,
            unit: "px",
          },
        },
        {
          type: "range",
          name: "sectionHeightMobile",
          label: "Height on mobile",
          defaultValue: 300,
          configs: {
            min: 250,
            max: 500,
            step: 10,
            unit: "px",
          },
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
    children: [
      {
        type: "subheading",
        content: "Seamless hero videos",
        color: "#fff",
      },
      {
        type: "heading",
        content: "Bring your brand to life.",
        size: "jumbo",
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
