import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import type { CSSProperties } from "react";
import { forwardRef } from "react";
import type { SectionProps } from "~/components/Section";
import { Section, sectionInspector } from "~/components/Section";

type HeroImageProps = SectionProps & {
  sectionHeightDesktop: number;
  sectionHeightMobile: number;
};

let HeroImage = forwardRef<HTMLElement, HeroImageProps>((props, ref) => {
  let { backgroundImage, children, ...rest } = props;
  let sectionStyle: CSSProperties = {
    justifyContent: `${contentAlignment}`,
    "--section-height-desktop": `${sectionHeightDesktop}px`,
    "--section-height-mobile": `${sectionHeightMobile}px`,
    "--overlay-opacity": `${overlayOpacity}%`,
    "--overlay-color": `${overlayColor}`,
    "--max-width-content": "600px",
  } as CSSProperties;

  return (
    <Section ref={ref} {...rest} style={sectionStyle}>
      {children}
    </Section>
  );
});

export default HeroImage;

export let schema: HydrogenComponentSchema = {
  type: "hero-image",
  title: "Hero image",
  toolbar: ["general-settings", ["duplicate", "delete"]],
  inspector: [sectionInspector],
  childTypes: ["subheading", "heading", "description", "button"],
  presets: {
    children: [
      {
        type: "subheading",
        content: "Subheading",
      },
      {
        type: "heading",
        content: "Hero image with text overlay",
      },
      {
        type: "description",
        content:
          "Use this text to share information about your brand with your customers. Describe a product, share announcements, or welcome customers to your store.",
      },
    ],
  },
};
