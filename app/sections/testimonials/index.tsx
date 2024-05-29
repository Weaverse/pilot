import { type HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { SectionProps } from "~/components/Section";
import { Section, sectionInspector } from "~/components/Section";

type TestimonialsProps = SectionProps & {
  heading: string;
  description: string;
};

let Testimonials = forwardRef<HTMLElement, TestimonialsProps>((props, ref) => {
  let { heading, description, children, ...rest } = props;

  return (
    <Section ref={ref} {...rest}>
      {children}
    </Section>
  );
});

export default Testimonials;

export let schema: HydrogenComponentSchema = {
  type: "testimonials",
  title: "Testimonials",
  childTypes: ["subheading", "heading", "paragraph", "testimonials-items"],
  inspector: sectionInspector,
  toolbar: ["general-settings", ["duplicate", "delete"]],
  presets: {
    children: [
      {
        type: "heading",
        content: "See what our customers are saying",
      },
      {
        type: "paragraph",
        content:
          "We are a team of passionate people whose goal is to improve everyone's life through disruptive products. We build great products to solve your business problems.",
      },
      {
        type: "testimonials-items",
      },
    ],
  },
};
