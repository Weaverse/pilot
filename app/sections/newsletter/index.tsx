import { createSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { SectionProps } from "~/components/section";
import { Section, sectionSettings } from "~/components/section";

type NewsLetterProps = SectionProps;

const NewsLetter = forwardRef<HTMLElement, NewsLetterProps>((props, ref) => {
  const { children, ...rest } = props;
  return (
    <Section ref={ref} {...rest}>
      {children}
    </Section>
  );
});

export default NewsLetter;

export const schema = createSchema({
  type: "newsletter",
  title: "Newsletter",
  settings: sectionSettings,
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
});
