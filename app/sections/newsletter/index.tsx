import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { SectionProps } from "~/components/section";
import { Section, sectionInspector } from "~/components/section";

type NewsLetterProps = SectionProps;

let NewsLetter = forwardRef<HTMLElement, NewsLetterProps>((props, ref) => {
  let { children, ...rest } = props;
  return (
    <Section ref={ref} {...rest}>
      {children}
    </Section>
  );
});

export default NewsLetter;

export let schema: HydrogenComponentSchema = {
  type: "newsletter",
  title: "Newsletter",
  inspector: sectionInspector,
  childTypes: ["subheading", "heading", "paragraph", "newsletter-form"],
  presets: {
    gap: 20,
    children: [
      {
        type: "heading",
        content: "SIGN UP & SAVE 15%",
      },
      {
        type: "paragraph",
        content:
          "Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.",
      },
      { type: "newsletter-form" },
    ],
  },
};
