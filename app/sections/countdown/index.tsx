import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { Section, SectionProps, sectionInspector } from "../shared/Section";

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
        content: "Countdown heading",
      },
      {
        type: "subheading",
        content: "Countdown to our upcoming event",
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
