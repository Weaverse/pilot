import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { SectionProps } from "~/components/section";
import { Section, sectionInspector } from "~/components/section";

type ColumnsWithImagesProps = SectionProps;

let ColumnsWithImages = forwardRef<HTMLElement, ColumnsWithImagesProps>(
  (props, ref) => {
    let { children, ...rest } = props;
    return (
      <Section ref={ref} {...rest}>
        {children}
      </Section>
    );
  },
);

export default ColumnsWithImages;

export let schema: HydrogenComponentSchema = {
  type: "columns-with-images",
  title: "Columns with images",
  inspector: sectionInspector,
  childTypes: [
    "columns-with-images--items",
    "subheading",
    "heading",
    "paragraph",
  ],
  presets: {
    gap: 48,
    children: [
      {
        type: "heading",
        content: "Columns with images",
      },
      {
        type: "columns-with-images--items",
      },
    ],
  },
};
