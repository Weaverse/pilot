import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { SectionProps } from "~/components/section";
import { Section, sectionInspector } from "~/components/section";

type VideoEmbedProps = SectionProps;

let VideoEmbed = forwardRef<HTMLElement, VideoEmbedProps>((props, ref) => {
  let { children, ...rest } = props;
  return (
    <Section ref={ref} {...rest}>
      {children}
    </Section>
  );
});

export default VideoEmbed;

export let schema: HydrogenComponentSchema = {
  type: "video",
  title: "Video embed",
  inspector: sectionInspector,
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
};
