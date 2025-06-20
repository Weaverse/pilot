import { createSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { SectionProps } from "~/components/section";
import { Section, sectionSettings } from "~/components/section";

type ColumnsWithImagesProps = SectionProps;

const ColumnsWithImages = forwardRef<HTMLElement, ColumnsWithImagesProps>(
  (props, ref) => {
    const { children, ...rest } = props;
    return (
      <Section ref={ref} {...rest}>
        {children}
      </Section>
    );
  },
);

export default ColumnsWithImages;

export const schema = createSchema({
  type: "columns-with-images",
  title: "Columns with images",
  settings: sectionSettings,
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
});
