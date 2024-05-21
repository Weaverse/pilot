import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { SectionProps } from "~/components/Section";
import { Section, sectionInspector } from "~/components/Section";

type CountdownProps = SectionProps;

let Countdown = forwardRef<HTMLElement, CountdownProps>((props, ref) => {
  let { children, ...rest } = props;
  return (
    <Section ref={ref} {...rest}>
      {children}
    </Section>
  );
});

export default Countdown;

export let schema: HydrogenComponentSchema = {
  type: "countdown",
  title: "Countdown",
  toolbar: ["general-settings", ["duplicate", "delete"]],
  inspector: [sectionInspector],
  childTypes: ["heading", "subheading", "countdown--timer", "button"],
  presets: {
    children: [
      {
        type: "heading",
        content: "Sale ends in",
      },
      {
        type: "subheading",
        content:
          "Insert the time limit or an encouraging message of your marketing campaign to create a sense of urgency for your customers.",
      },
      {
        type: "countdown--timer",
      },
      {
        type: "button",
      },
    ],
  },
};
