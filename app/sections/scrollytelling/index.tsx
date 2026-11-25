import {
  createSchema,
  IMAGES_PLACEHOLDERS,
} from "@weaverse/hydrogen/react-router";
import { cva } from "class-variance-authority";
import { Children, type CSSProperties, useEffect, useRef } from "react";
import { backgroundInputs } from "~/components/background-image";
import type { SectionProps } from "~/components/section";
import { layoutInputs, Section } from "~/components/section";

interface ScrollytellingProps extends SectionProps {
  mediaPosition: "left" | "right";
}

const gridVariants = cva("scrollytelling md:grid md:grid-cols-2 md:gap-x-12", {
  variants: {
    mediaPosition: {
      left: "md:[&_.scrollytelling-media]:col-start-1 md:[&_[data-step]]:col-start-2",
      right:
        "md:[&_.scrollytelling-media]:col-start-2 md:[&_[data-step]]:col-start-1",
    },
  },
  defaultVariants: { mediaPosition: "right" },
});

/**
 * Text steps scroll past a pinned image column; the image of the step
 * crossing the middle of the screen fades in. Steps render their image as a
 * sibling grid item, so all images share one sticky cell (see
 * `.scrollytelling` in app.css). Stacks image-then-text on mobile.
 */
export default function Scrollytelling(props: ScrollytellingProps) {
  let { mediaPosition, children, ...rest } = props;
  let gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let steps = gridRef.current?.querySelectorAll("[data-step]");
    if (!steps?.length) {
      return;
    }
    let observer = new IntersectionObserver(
      (entries) => {
        for (let entry of entries) {
          if (entry.isIntersecting) {
            for (let step of steps) {
              step.toggleAttribute("data-active", step === entry.target);
            }
          }
        }
      },
      // A step is active while it crosses the vertical middle of the screen.
      { rootMargin: "-50% 0px -50% 0px" },
    );
    for (let step of steps) {
      observer.observe(step);
    }
    return () => observer.disconnect();
  }, [children]);

  return (
    <Section {...rest} overflow="unset">
      <div
        ref={gridRef}
        className={gridVariants({ mediaPosition })}
        style={{ "--steps": Children.count(children) } as CSSProperties}
      >
        {children}
      </div>
    </Section>
  );
}

export const schema = createSchema({
  type: "scrollytelling",
  title: "Scrollytelling",
  settings: [
    {
      group: "Layout",
      inputs: [
        {
          type: "toggle-group",
          name: "mediaPosition",
          label: "Image position",
          configs: {
            options: [
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ],
          },
          defaultValue: "right",
        },
        ...layoutInputs.filter(({ name }) => name !== "gap"),
      ],
    },
    { group: "Background", inputs: backgroundInputs },
  ],
  childTypes: ["scrollytelling--step"],
  presets: {
    mediaPosition: "right",
    verticalPadding: "none",
    children: [
      {
        type: "scrollytelling--step",
        image: IMAGES_PLACEHOLDERS.collection_1,
        children: [
          { type: "subheading", content: "01 · Material", alignment: "left" },
          {
            type: "heading",
            content: "Chosen for how it ages",
            as: "h3",
            alignment: "left",
          },
          {
            type: "paragraph",
            content:
              "Start with the material. Tell shoppers where it comes from and why it gets better with use.",
            alignment: "left",
          },
        ],
      },
      {
        type: "scrollytelling--step",
        image: IMAGES_PLACEHOLDERS.collection_2,
        children: [
          { type: "subheading", content: "02 · Craft", alignment: "left" },
          {
            type: "heading",
            content: "Made by hand, in small runs",
            as: "h3",
            alignment: "left",
          },
          {
            type: "paragraph",
            content:
              "Show the process. Each step swaps the image as shoppers scroll.",
            alignment: "left",
          },
        ],
      },
      {
        type: "scrollytelling--step",
        image: IMAGES_PLACEHOLDERS.collection_3,
        children: [
          { type: "subheading", content: "03 · Care", alignment: "left" },
          {
            type: "heading",
            content: "Built to be repaired",
            as: "h3",
            alignment: "left",
          },
          {
            type: "paragraph",
            content:
              "Finish with what happens after the purchase: care, repairs and guarantees.",
            alignment: "left",
          },
          { type: "button", content: "Shop the collection" },
        ],
      },
    ],
  },
});
