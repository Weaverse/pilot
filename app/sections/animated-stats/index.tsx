import { createSchema } from "@weaverse/hydrogen/react-router";
import type { SectionProps } from "~/components/section";
import { layoutInputs, Section } from "~/components/section";
import { backgroundInputs } from "~/components/background-image";

export default function AnimatedStats(props: SectionProps) {
  let { children, ...rest } = props;

  // Text children take a full row; stats share the rows below them.
  return (
    <Section
      {...rest}
      containerClassName="flex flex-wrap justify-center gap-y-10 *:basis-full [&>.stat]:basis-1/2 lg:[&>.stat]:basis-0 lg:[&>.stat]:grow"
    >
      {children}
    </Section>
  );
}

export const schema = createSchema({
  type: "animated-stats",
  title: "Animated stats",
  settings: [
    {
      group: "Layout",
      inputs: layoutInputs.filter(({ name }) => name !== "gap"),
    },
    { group: "Background", inputs: backgroundInputs },
  ],
  childTypes: ["heading", "subheading", "paragraph", "animated-stats--item"],
  presets: {
    children: [
      { type: "heading", content: "Made to be used" },
      {
        type: "animated-stats--item",
        value: "12500",
        suffix: "+",
        label: "Orders shipped",
      },
      {
        type: "animated-stats--item",
        value: "4.9",
        suffix: "/5",
        label: "Average review",
      },
      {
        type: "animated-stats--item",
        value: "38",
        label: "Countries we ship to",
      },
      {
        type: "animated-stats--item",
        value: "100",
        suffix: "%",
        label: "Recycled packaging",
      },
    ],
  },
});
