import {
  createSchema,
  IMAGES_PLACEHOLDERS,
  type WeaverseComponentProps,
  type WeaverseImage,
} from "@weaverse/hydrogen/react-router";
import { Image } from "~/components/image";
import { Link } from "~/components/link";

interface LookbookItemProps extends WeaverseComponentProps {
  ref?: React.Ref<HTMLElement>;
  image: WeaverseImage | string;
  aspectRatio: string;
  caption: string;
  link: string;
  linkText: string;
}

export default function LookbookItem(props: LookbookItemProps) {
  let { ref, image, aspectRatio, caption, link, linkText, ...rest } = props;
  let data = typeof image === "string" ? { url: image, altText: "" } : image;

  return (
    <figure ref={ref} {...rest} className="group shrink-0 snap-start">
      <div
        className="h-[55svh] overflow-hidden rounded-(--radius) md:h-[65svh]"
        style={{ aspectRatio: aspectRatio || "3/4" }}
      >
        {data?.url && (
          <Image
            data={data}
            sizes="(min-width: 768px) 40vw, 80vw"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
      </div>
      {(caption || link) && (
        // `w-0 min-w-full`: the caption never widens the look past its image.
        <figcaption className="mt-3 flex w-0 min-w-full items-baseline justify-between gap-4 text-sm">
          <span>{caption}</span>
          {link && (
            <Link to={link} variant="underline" animate={false}>
              {linkText || "Shop the look"}
            </Link>
          )}
        </figcaption>
      )}
    </figure>
  );
}

export const schema = createSchema({
  type: "horizontal-lookbook--item",
  title: "Look",
  settings: [
    {
      group: "Look",
      inputs: [
        { type: "image", name: "image", label: "Image" },
        {
          type: "select",
          name: "aspectRatio",
          label: "Shape",
          configs: {
            options: [
              { value: "3/4", label: "Portrait (3:4)" },
              { value: "1/1", label: "Square (1:1)" },
              { value: "4/3", label: "Landscape (4:3)" },
              { value: "16/9", label: "Wide (16:9)" },
            ],
          },
          defaultValue: "3/4",
        },
        { type: "text", name: "caption", label: "Caption" },
        { type: "url", name: "link", label: "Link" },
        {
          type: "text",
          name: "linkText",
          label: "Link text",
          defaultValue: "Shop the look",
          condition: (data: LookbookItemProps) => Boolean(data.link),
        },
      ],
    },
  ],
  presets: {
    image: IMAGES_PLACEHOLDERS.collection_1,
    aspectRatio: "3/4",
    caption: "New look",
  },
});
