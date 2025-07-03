import {
  createSchema,
  type HydrogenComponentProps,
  type WeaverseVideo,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";

const variants = cva("mx-auto aspect-video w-full", {
  variants: {
    size: {
      small: "md:w-1/2",
      medium: "md:w-3/4",
      large: "",
    },
    borderRadius: {
      0: "",
      2: "rounded-xs",
      4: "rounded-sm",
      6: "rounded-md",
      8: "rounded-lg",
      10: "rounded-[10px]",
      12: "rounded-xl",
      14: "rounded-[14px]",
      16: "rounded-2xl",
      18: "rounded-[18px]",
      20: "rounded-[20px]",
      22: "rounded-[22px]",
      24: "rounded-3xl",
      26: "rounded-[26px]",
      28: "rounded-[28px]",
      30: "rounded-[30px]",
      32: "rounded-[32px]",
      34: "rounded-[34px]",
      36: "rounded-[36px]",
      38: "rounded-[38px]",
      40: "rounded-[40px]",
    },
  },
  defaultVariants: {
    size: "medium",
    borderRadius: 0,
  },
});

interface VideoItemProps
  extends VariantProps<typeof variants>,
    HydrogenComponentProps {
  video: WeaverseVideo;
  videoUrl: string;
}

const VideoEmbedItem = forwardRef<HTMLIFrameElement, VideoItemProps>(
  (props, ref) => {
    const { video, videoUrl, size, borderRadius, ...rest } = props;
    return (
      <iframe
        ref={ref}
        {...rest}
        className={variants({ size, borderRadius })}
        src={video?.url || videoUrl}
        allowFullScreen
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-presentation allow-same-origin allow-scripts"
      />
    );
  },
);

export default VideoEmbedItem;

export const schema = createSchema({
  type: "video-embed--item",
  title: "Video",
  settings: [
    {
      group: "Video",
      inputs: [
        {
          type: "video",
          name: "video",
          label: "Video",
          helpText:
            "If no video is selected, the component will fallback to use the Embed URL below.",
        },
        {
          type: "text",
          name: "videoUrl",
          label: "Embed URL",
          defaultValue: "https://www.youtube.com/embed/Su-x4Mo5xmU",
          placeholder: "https://www.youtube.com/embed/Su-x4Mo5xmU",
          helpText:
            'How to get YouTube <a target="_blank" href="https://support.google.com/youtube/answer/171780?hl=en#:~:text=On%20a%20computer%2C%20go%20to,appears%2C%20copy%20the%20HTML%20code.">embed code</a>.',
        },
        {
          type: "select",
          name: "size",
          label: "Size",
          defaultValue: "medium",
          configs: {
            options: [
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
            ],
          },
          helpText: "For desktop only.",
        },
        {
          type: "range",
          name: "borderRadius",
          label: "Border radius",
          configs: {
            min: 0,
            max: 40,
            step: 2,
            unit: "px",
          },
          defaultValue: 0,
        },
      ],
    },
  ],
});
