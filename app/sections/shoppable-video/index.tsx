import {
  createSchema,
  IMAGES_PLACEHOLDERS,
} from "@weaverse/hydrogen/react-router";
import { backgroundInputs } from "~/components/background-image";
import type { SectionProps } from "~/components/section";
import { layoutInputs, Section } from "~/components/section";

interface ShoppableVideoProps extends SectionProps {
  heading: string;
}

export default function ShoppableVideo(props: ShoppableVideoProps) {
  let { heading, children, ...rest } = props;

  return (
    <Section {...rest} containerClassName="space-y-8">
      {heading && (
        <h2 className="text-center text-3xl md:text-4xl">{heading}</h2>
      )}
      {/* Auto margins center a short row and still let a long one scroll
          from its first video. */}
      <div className="hidden-scroll flex snap-x snap-mandatory gap-4 overflow-x-auto *:first:ml-auto *:last:mr-auto">
        {children}
      </div>
    </Section>
  );
}

export const schema = createSchema({
  type: "shoppable-video",
  title: "Shoppable video",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "heading",
          label: "Heading",
          defaultValue: "Shop the video",
        },
      ],
    },
    {
      group: "Layout",
      inputs: layoutInputs.filter(({ name }) => name !== "gap"),
    },
    { group: "Background", inputs: backgroundInputs },
  ],
  childTypes: ["shoppable-video--item"],
  presets: {
    heading: "Shop the video",
    children: [
      { type: "shoppable-video--item", poster: IMAGES_PLACEHOLDERS.product_1 },
      { type: "shoppable-video--item", poster: IMAGES_PLACEHOLDERS.product_2 },
      { type: "shoppable-video--item", poster: IMAGES_PLACEHOLDERS.product_3 },
      { type: "shoppable-video--item", poster: IMAGES_PLACEHOLDERS.product_4 },
    ],
  },
});
