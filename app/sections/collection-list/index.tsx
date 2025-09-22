import { createSchema } from "@weaverse/hydrogen";
import { layoutInputs, Section, type SectionProps } from "~/components/section";

interface CollectionListProps extends SectionProps {
  ref?: React.Ref<HTMLElement>;
}

function CollectionList(props: CollectionListProps) {
  const { children, ref, ...rest } = props;
  return (
    <Section ref={ref} {...rest}>
      {children}
    </Section>
  );
}

export default CollectionList;

export const schema = createSchema({
  type: "collection-list",
  title: "Collection list",
  limit: 1,
  childTypes: ["subheading", "heading", "paragraph", "collections-items"],
  enabledOn: {
    pages: ["COLLECTION_LIST"],
  },
  settings: [
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
        prevButtonText: "↑ Load previous",
        nextButtonText: "Load more ↓",
        imageAspectRatio: "adapt",
        enableOverlay: true,
        overlayColor: "#000",
        overlayOpacity: 30,
      },
    ],
  },
});
