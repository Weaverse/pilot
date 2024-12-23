import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { Section, type SectionProps, layoutInputs } from "~/components/section";

let CollectionList = forwardRef<HTMLElement, SectionProps>((props, ref) => {
  let { children, ...rest } = props;
  return (
    <Section ref={ref} {...rest}>
      {children}
    </Section>
  );
});

export default CollectionList;

export let schema: HydrogenComponentSchema = {
  type: "collection-list",
  title: "Collection list",
  limit: 1,
  childTypes: ["subheading", "heading", "paragraph", "collections-items"],
  enabledOn: {
    pages: ["COLLECTION_LIST"],
  },
  inspector: [
    {
      group: "Layout",
      inputs: layoutInputs.filter((input) => input.name !== "borderRadius"),
    },
  ],
  presets: {
    gap: 60,
    children: [
      {
        type: "heading",
        content: "Collections",
      },
      {
        type: "collections-items",
        prevButtonText: "Previous",
        nextButtonText: "Next",
        imageAspectRatio: "adapt",
        enableOverlay: true,
        overlayColor: "#000",
        overlayOpacity: 30,
      },
    ],
  },
};
