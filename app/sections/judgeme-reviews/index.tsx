import { createSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { layoutInputs, Section, type SectionProps } from "~/components/section";

const JudgemeReviewSection = forwardRef<HTMLElement, SectionProps>(
  (props, ref) => {
    const { children, loaderData, ...rest } = props;
    return (
      <Section ref={ref} {...rest} overflow="unset">
        {children}
      </Section>
    );
  },
);

export default JudgemeReviewSection;

export const schema = createSchema({
  type: "judgeme-reviews",
  title: "Judgeme Reviews",
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [
    {
      group: "Layout",
      inputs: layoutInputs.filter((inp) => inp.name !== "borderRadius"),
    },
  ],
  childTypes: ["heading", "paragraph", "judgeme-review--index"],
  presets: {
    children: [
      {
        type: "heading",
        Content: "Reviews",
      },
      {
        type: "paragraph",
        Content: "Reviews from Judgeme",
      },
      {
        type: "judgeme-review--index",
      },
    ],
  },
});
