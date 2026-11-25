import {
  createSchema,
  IMAGES_PLACEHOLDERS,
  type WeaverseComponentProps,
  type WeaverseImage,
} from "@weaverse/hydrogen/react-router";
import { Image } from "~/components/image";

interface ScrollytellingStepProps extends WeaverseComponentProps {
  ref?: React.Ref<HTMLDivElement>;
  image: WeaverseImage | string;
}

export default function ScrollytellingStep(props: ScrollytellingStepProps) {
  let { ref, image, children, ...rest } = props;
  let data = typeof image === "string" ? { url: image, altText: "" } : image;

  // Two grid items: the image (stacked into the shared sticky cell on
  // desktop) and the text, which is what Studio selects.
  return (
    <>
      <div className="scrollytelling-media">
        {data?.url && (
          <Image
            data={data}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="h-full w-full rounded-(--radius) object-cover"
          />
        )}
      </div>
      <div
        ref={ref}
        {...rest}
        data-step
        className="flex flex-col justify-center gap-4 py-8 md:min-h-svh md:py-24 [&_.paragraph]:w-full [&>a]:self-start"
      >
        {children}
      </div>
    </>
  );
}

export const schema = createSchema({
  type: "scrollytelling--step",
  title: "Step",
  settings: [
    {
      group: "Step",
      inputs: [{ type: "image", name: "image", label: "Image" }],
    },
  ],
  childTypes: ["subheading", "heading", "paragraph", "button"],
  presets: {
    image: IMAGES_PLACEHOLDERS.image,
    children: [
      { type: "subheading", content: "Step", alignment: "left" },
      {
        type: "heading",
        content: "Tell one part of the story",
        as: "h3",
        alignment: "left",
      },
      {
        type: "paragraph",
        content: "The image beside this text shows while it is on screen.",
        alignment: "left",
      },
    ],
  },
});
