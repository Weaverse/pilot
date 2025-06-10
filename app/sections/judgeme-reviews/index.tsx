import { createSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { layoutInputs, Section, type SectionProps } from "~/components/section";

let JudgemeReviewSection = forwardRef<HTMLElement, SectionProps>(
  (props, ref) => {
    let { children, loaderData, ...rest } = props;
    return (
      <Section ref={ref} {...rest} overflow="unset">
        {children}
      </Section>
    );
  },
);

export default JudgemeReviewSection;

export let schema = createSchema({
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
