import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { Section, type SectionProps, layoutInputs } from "~/components/section";

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

export let schema: HydrogenComponentSchema = {
  type: "judgeme-reviews",
  title: "Judgeme Reviews",
  enabledOn: {
    pages: ["PRODUCT"],
  },
  inspector: [
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
};
