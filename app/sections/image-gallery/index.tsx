import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { SectionProps } from "~/components/Section";
import { Section, sectionInspector } from "~/components/Section";

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

export let schema: HydrogenComponentSchema = {
  type: "image-gallery",
  title: "Image gallery",
  childTypes: ["subheading", "heading", "paragraph", "image-gallery--items"],
  inspector: sectionInspector,
  toolbar: ["general-settings", ["duplicate", "delete"]],
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
};
