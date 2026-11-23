import {
  createSchema,
  IMAGES_PLACEHOLDERS,
  type WeaverseComponentProps,
  type WeaverseImage,
} from "@weaverse/hydrogen/react-router";
import type { CSSProperties } from "react";
import { Image } from "~/components/image";
import { Overlay, type OverlayData, overlayInputs } from "~/components/overlay";
import { cn } from "~/utils/cn";
import { variants } from "../hero-video/styles";

type ContentPosition = NonNullable<
  Parameters<typeof variants>[0]
>["contentPosition"];

interface ScrollZoomProps extends WeaverseComponentProps, OverlayData {
  ref?: React.Ref<HTMLElement>;
  image: WeaverseImage | string;
  startSize: number;
  contentPosition: ContentPosition;
}

/**
 * An inset image grows to full-bleed while the section is pinned, then the
 * content fades in. Pure CSS scroll-driven animation (see `.scroll-zoom` in
 * app.css); browsers without `animation-timeline` or visitors with reduced
 * motion get a static full-screen image.
 */
export default function ScrollZoom(props: ScrollZoomProps) {
  let {
    ref,
    image,
    startSize,
    contentPosition,
    enableOverlay,
    overlayColor,
    overlayColorHover,
    overlayOpacity,
    children,
    ...rest
  } = props;
  let data = typeof image === "string" ? { url: image, altText: "" } : image;
  // `startSize` is the share of the screen the image covers at first.
  let inset = (100 - (startSize ?? 60)) / 2;

  return (
    <section
      ref={ref}
      {...rest}
      className="scroll-zoom relative"
      style={{ "--scroll-zoom-inset": `${inset}%` } as CSSProperties}
    >
      <div className="h-screen-dynamic sticky top-0 overflow-hidden">
        <div className="scroll-zoom-media absolute inset-0 isolate">
          {data?.url && (
            <Image
              data={data}
              sizes="100vw"
              className="h-full w-full object-cover"
            />
          )}
          <Overlay
            enableOverlay={enableOverlay}
            overlayColor={overlayColor}
            overlayColorHover={overlayColorHover}
            overlayOpacity={overlayOpacity}
            className="z-0"
          />
        </div>
        <div
          className={cn(
            "scroll-zoom-content",
            variants({
              contentPosition,
              width: "stretch",
              verticalPadding: "large",
            }),
            "gap-4",
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

export const schema = createSchema({
  type: "scroll-zoom",
  title: "Scroll zoom",
  settings: [
    {
      group: "Media",
      inputs: [
        {
          type: "image",
          name: "image",
          label: "Image",
        },
        {
          type: "range",
          name: "startSize",
          label: "Starting size",
          configs: { min: 30, max: 90, step: 5, unit: "%" },
          defaultValue: 60,
          helpText:
            "How much of the screen the image covers before it grows to full width while scrolling.",
        },
        {
          type: "position",
          name: "contentPosition",
          label: "Content position",
          defaultValue: "center center",
        },
      ],
    },
    { group: "Overlay", inputs: overlayInputs },
  ],
  childTypes: ["subheading", "heading", "paragraph", "button"],
  presets: {
    image: IMAGES_PLACEHOLDERS.banner_1,
    startSize: 60,
    contentPosition: "center center",
    enableOverlay: true,
    overlayOpacity: 30,
    children: [
      { type: "subheading", content: "Scroll to explore", color: "#ffffff" },
      {
        type: "heading",
        content: "Made for the long way round",
        as: "h2",
        color: "#ffffff",
        size: "default",
      },
      {
        type: "paragraph",
        content:
          "Tell the story behind a collection: the image grows to full width as shoppers scroll, then your message appears.",
        color: "#ffffff",
      },
    ],
  },
});
