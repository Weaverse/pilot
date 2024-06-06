import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import { backgroundInputs } from "~/components/BackgroundImage";
import { overlayInputs } from "~/components/Overlay";
import type { SectionProps } from "~/components/Section";
import { Section, layoutInputs } from "~/components/Section";

type PromotionGridProps = VariantProps<typeof variants> & SectionProps;

let variants = cva("flex sm:grid", {
  variants: {
    gridSize: {
      2: "sm:grid-cols-2",
      3: "sm:grid-cols-3",
      4: "sm:grid-cols-4",
    },
    gap: {
      0: "",
      4: "gap-1",
      8: "gap-2",
      12: "gap-3",
      16: "gap-4",
      20: "gap-5",
      24: "gap-3 lg:gap-6",
      28: "gap-3.5 lg:gap-7",
      32: "gap-4 lg:gap-8",
      36: "gap-4 lg:gap-9",
      40: "gap-5 lg:gap-10",
      44: "gap-5 lg:gap-11",
      48: "gap-6 lg:gap-12",
      52: "gap-6 lg:gap-[52px]",
      56: "gap-7 lg:gap-14",
      60: "gap-7 lg:gap-[60px]",
    },
  },
  defaultVariants: {
    gridSize: 2,
    gap: 20,
  },
});

let PromotionGrid = forwardRef<HTMLElement, PromotionGridProps>(
  (props, ref) => {
    let { children, gridSize, gap, ...rest } = props;
    return (
      <Section
        ref={ref}
        {...rest}
        containerClassName={variants({ gridSize, gap })}
      >
        {children}
      </Section>
    );
  },
);

export default PromotionGrid;

export let schema: HydrogenComponentSchema = {
  type: "promotion-grid",
  title: "Promotion grid",
  toolbar: ["general-settings", ["duplicate", "delete"]],
  inspector: [
    {
      group: "Grid",
      inputs: [
        {
          type: "toggle-group",
          name: "gridSize",
          label: "Grid size",
          configs: {
            options: [
              { value: "2", label: "2x2" },
              { value: "3", label: "3x3" },
              { value: "4", label: "4x4" },
            ],
          },
          defaultValue: "2",
        },
      ],
    },
    { group: "Layout", inputs: layoutInputs },
    { group: "Background", inputs: backgroundInputs },
    { group: "Overlay", inputs: overlayInputs },
  ],
  childTypes: ["heading", "paragraph", "promotion-grid-item"],
  presets: {
    children: [
      {
        type: "promotion-grid-item",
      },
      {
        type: "promotion-grid-item",
      },
    ],
  },
};
