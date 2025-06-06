import { createSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { SectionProps } from "~/components/section";
import { Section, sectionSettings } from "~/components/section";

type ImageGalleryProps = SectionProps;

let ImageGallery = forwardRef<HTMLElement, ImageGalleryProps>((props, ref) => {
  let { children, ...rest } = props;
  return (
    <Section ref={ref} {...rest}>
      {children}
    </Section>
  );
});

export default ImageGallery;

export let schema = createSchema({
  type: "image-gallery",
  title: "Image gallery",
  childTypes: ["subheading", "heading", "paragraph", "image-gallery--items"],
  settings: sectionSettings,
  presets: {
    children: [
      {
        type: "heading",
        content: "Image Gallery",
      },
      {
        type: "paragraph",
        content:
          "Showcase your chosen images. This visual focus will enhance user engagement and understanding of your offerings.",
      },
      {
        type: "image-gallery--items",
      },
    ],
  },
});
