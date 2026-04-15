import {
  createSchema,
  type HydrogenComponentProps,
  type WeaverseVideo,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

const variants = cva("mx-auto aspect-video w-full rounded-md", {
  variants: {
    size: {
      small: "md:w-1/2",
      medium: "md:w-3/4",
      large: "",
    },
  },
  defaultVariants: {
    size: "medium",
  },
});

interface VideoItemProps
  extends VariantProps<typeof variants>,
    HydrogenComponentProps {
  video: WeaverseVideo;
  videoUrl: string;
}

export default function VideoEmbedItem(props: VideoItemProps) {
  const { video, videoUrl, size, ...rest } = props;
  return (
    <iframe
      {...rest}
      className={variants({ size })}
      src={video?.url || videoUrl}
      allowFullScreen
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      sandbox="allow-presentation allow-same-origin allow-scripts"
    />
  );
}

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
      ],
    },
  ],
});
