import {
  createSchema,
  IMAGES_PLACEHOLDERS,
  type WeaverseComponentProps,
} from "@weaverse/hydrogen/react-router";
import { Children, type CSSProperties } from "react";

interface HorizontalLookbookProps extends WeaverseComponentProps {
  ref?: React.Ref<HTMLElement>;
  heading: string;
  description: string;
  backgroundColor: string;
}

/**
 * Vertical scroll moves a row of looks sideways while the section is pinned.
 * Pure CSS scroll-driven animation (see `.lookbook` in app.css); browsers
 * without `animation-timeline` or visitors with reduced motion get a row
 * they swipe or scroll sideways.
 */
export default function HorizontalLookbook(props: HorizontalLookbookProps) {
  let { ref, heading, description, backgroundColor, children, ...rest } = props;

  return (
    <section
      ref={ref}
      {...rest}
      className="lookbook relative"
      style={
        {
          backgroundColor,
          "--lookbook-items": Children.count(children),
        } as CSSProperties
      }
    >
      <div className="lookbook-frame hidden-scroll">
        <div className="lookbook-track flex w-max items-center gap-6 px-3 md:gap-10 md:px-10 lg:px-16">
          {(heading || description) && (
            <div className="w-[min(80vw,26rem)] shrink-0 snap-start space-y-4">
              {heading && (
                <h2 className="text-4xl leading-tight md:text-5xl">
                  {heading}
                </h2>
              )}
              {description && <p className="text-body-subtle">{description}</p>}
            </div>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

export const schema = createSchema({
  type: "horizontal-lookbook",
  title: "Horizontal lookbook",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "heading",
          label: "Heading",
          defaultValue: "The lookbook",
        },
        {
          type: "textarea",
          name: "description",
          label: "Description",
          defaultValue: "Scroll through the season, one look at a time.",
        },
        { type: "color", name: "backgroundColor", label: "Background color" },
      ],
    },
  ],
  childTypes: ["horizontal-lookbook--item"],
  presets: {
    heading: "The lookbook",
    description: "Scroll through the season, one look at a time.",
    children: [
      {
        type: "horizontal-lookbook--item",
        image: IMAGES_PLACEHOLDERS.collection_1,
        caption: "Look 01",
      },
      {
        type: "horizontal-lookbook--item",
        image: IMAGES_PLACEHOLDERS.banner_1,
        aspectRatio: "4/3",
        caption: "Look 02",
      },
      {
        type: "horizontal-lookbook--item",
        image: IMAGES_PLACEHOLDERS.collection_2,
        caption: "Look 03",
      },
      {
        type: "horizontal-lookbook--item",
        image: IMAGES_PLACEHOLDERS.collection_3,
        aspectRatio: "1/1",
        caption: "Look 04",
      },
      {
        type: "horizontal-lookbook--item",
        image: IMAGES_PLACEHOLDERS.banner_2,
        aspectRatio: "4/3",
        caption: "Look 05",
      },
    ],
  },
});
