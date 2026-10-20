import { expect, test } from "@playwright/test";
import { loadAppModule } from "../support/render-app";

type LabelSchema = {
  title: string;
  label?: (data: Record<string, unknown>) => string | null | undefined;
};

/** Each opt-in component and the plain-text field its label reads. */
const OPT_INS = [
  { entry: "components/heading.tsx", field: "content", title: "Heading" },
  { entry: "components/subheading.tsx", field: "content", title: "Subheading" },
  {
    entry: "sections/testimonials/item.tsx",
    field: "heading",
    title: "Testimonial",
  },
  {
    entry: "sections/main-product/product-highlight-item.tsx",
    field: "text",
    title: "Highlight item",
  },
  {
    entry: "sections/columns-with-images/column.tsx",
    field: "heading",
    title: "Column",
  },
];

for (const { entry, field, title } of OPT_INS) {
  test(`${entry} labels elements from ${field}`, async () => {
    const { schema } = await loadAppModule<{ schema: LabelSchema }>(entry);
    const english = Object.freeze({ [field]: "Summer sale" });
    const german = Object.freeze({ [field]: "Sommerschlussverkauf" });

    expect(schema.title).toBe(title);
    expect(schema.label?.(english)).toBe("Summer sale");
    expect(schema.label?.(german)).toBe("Sommerschlussverkauf");
    expect(schema.label?.({})).toBeUndefined();
    expect(english).toEqual({ [field]: "Summer sale" });
  });
}
