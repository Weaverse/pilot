import { createSchema } from "@weaverse/hydrogen/react-router";
import { createContext, useId } from "react";
import type { SectionProps } from "~/components/section";
import { layoutInputs, Section } from "~/components/section";

/** The radio group name shared by a section's tabs. */
export const TabGroupContext = createContext("");

/**
 * Product tabs with no JavaScript: each tab renders a hidden radio, its label
 * and its panel as siblings. Labels line up first, panels wrap below them
 * (`order`), and the checked radio's panel shows (see `.tabbed-products` in
 * app.css). The first tab shows until another is picked.
 */
export default function TabbedProducts(props: SectionProps) {
  let { children, ...rest } = props;
  let group = useId();

  return (
    <Section
      {...rest}
      containerClassName="tabbed-products flex flex-wrap justify-center gap-x-8 gap-y-6 *:basis-full [&>label]:basis-auto"
    >
      <TabGroupContext value={group}>{children}</TabGroupContext>
    </Section>
  );
}

export const schema = createSchema({
  type: "tabbed-products",
  title: "Tabbed products",
  settings: [{ group: "Layout", inputs: layoutInputs }],
  childTypes: ["heading", "subheading", "paragraph", "tabbed-products--tab"],
  presets: {
    gap: 32,
    children: [
      { type: "heading", content: "Shop by category" },
      { type: "tabbed-products--tab", label: "Best sellers" },
      { type: "tabbed-products--tab", label: "New arrivals" },
      { type: "tabbed-products--tab", label: "On sale" },
    ],
  },
});
