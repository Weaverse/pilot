import { createSchema } from "@weaverse/hydrogen";
import type { SectionProps } from "~/components/section";
import { Section, sectionSettings } from "~/components/section";

interface ContactUsProps extends SectionProps {}

function ContactUs(props: ContactUsProps) {
  const { children, ...rest } = props;
  return <Section {...rest}>{children}</Section>;
}

export default ContactUs;

export const schema = createSchema({
  type: "contact-us",
  title: "Contact us",
  settings: sectionSettings,
  childTypes: ["subheading", "heading", "paragraph", "message-us-button"],
  presets: {
    gap: 20,
    children: [
      { type: "subheading", content: "Support" },
      { type: "heading", content: "Need help?" },
      {
        type: "paragraph",
        content:
          "Chat with our team and we'll get back to you as soon as possible.",
      },
      { type: "message-us-button" },
    ],
  },
});
