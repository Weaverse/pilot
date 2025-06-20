import { createSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { SectionProps } from "~/components/section";
import { Section, sectionSettings } from "~/components/section";

type VideoEmbedProps = SectionProps;

const VideoEmbed = forwardRef<HTMLElement, VideoEmbedProps>((props, ref) => {
  const { children, ...rest } = props;
  return (
    <Section ref={ref} {...rest}>
      {children}
    </Section>
  );
});

export default VideoEmbed;

export const schema = createSchema({
  type: "video-embed",
  title: "Video embed",
  settings: sectionSettings,
  childTypes: ["heading", "paragraph", "video-embed--item"],
  presets: {
    children: [
      {
        type: "heading",
        content: "Video embed",
      },
      {
        type: "paragraph",
        content:
          "A picture is worth a thousand words, and a video is worth even more. Utilize this space to engage, inform, and convince your customers.",
      },
      {
        type: "video-embed--item",
      },
    ],
  },
});
