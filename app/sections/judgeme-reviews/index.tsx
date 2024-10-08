import type {
  HydrogenComponentSchema
} from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { backgroundInputs } from "~/components/background-image";
import { Section, layoutInputs } from "~/components/section";

let JudgemeReviewSection = forwardRef<HTMLElement, any>((props, ref) => {
  let { children, loaderData, ...rest } = props;
  return (
    <Section ref={ref} {...rest} overflow="unset">
      <div className="max-w-4xl mx-auto py-6 px-8 bg-white rounded shadow">
        {children}
      </div>
    </Section>
  );
});

export default JudgemeReviewSection;

export let schema: HydrogenComponentSchema = {
  type: "judgeme-reviews",
  title: "Judgeme Reviews",
  inspector: [
    // {
    //   group: "Layout",
    //   inputs: layoutInputs.filter((inp) => inp.name !== "borderRadius"),
    // },
    // {
    //   group: "Background",
    //   inputs: backgroundInputs.filter((inp) => inp.name === "backgroundColor"),
    // },
  ],
  childTypes: [
    "heading",
    "subheading",
    "paragraph",
    "button",
    "judgeme-review--form",
    "judgeme-review--list",
  ],
};
