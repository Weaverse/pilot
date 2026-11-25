import {
  createSchema,
  IMAGES_PLACEHOLDERS,
  type WeaverseCollection,
} from "@weaverse/hydrogen/react-router";
import { Image } from "~/components/image";
import { Link } from "~/components/link";
import type { SectionProps } from "~/components/section";
import { layoutInputs, Section } from "~/components/section";
import {
  type FeaturedCollectionsLoaderData,
  loader as featuredCollectionsLoader,
} from "../featured-collections";

interface CollectionBubblesProps extends SectionProps<FeaturedCollectionsLoaderData> {
  collections: WeaverseCollection[];
}

const PLACEHOLDERS = [
  IMAGES_PLACEHOLDERS.collection_1,
  IMAGES_PLACEHOLDERS.collection_2,
  IMAGES_PLACEHOLDERS.collection_3,
  IMAGES_PLACEHOLDERS.product_1,
  IMAGES_PLACEHOLDERS.product_2,
];

/**
 * A row of round collection thumbnails with labels, like story bubbles: a
 * quick way into categories. Centered when it fits, scrolls sideways when not.
 */
export default function CollectionBubbles(props: CollectionBubblesProps) {
  let { loaderData, collections: _collections, ...rest } = props;
  let items = loaderData?.length
    ? loaderData.map((c) => ({
        key: c.id,
        title: c.title,
        to: `/collections/${c.handle}`,
        image: c.image,
      }))
    : PLACEHOLDERS.map((url, idx) => ({
        key: url,
        title: `Collection ${idx + 1}`,
        to: "/collections/all",
        image: { url, altText: "", width: 400, height: 400 },
      }));

  return (
    <Section {...rest}>
      <ul className="hidden-scroll flex snap-x gap-5 overflow-x-auto *:first:ml-auto *:last:mr-auto md:gap-8">
        {items.map((item) => (
          <li key={item.key} className="shrink-0 snap-start">
            <Link
              to={item.to}
              animate={false}
              className="group flex w-20 flex-col items-center gap-3 md:w-24"
            >
              <span className="ring-line-subtle group-hover:ring-body block size-20 overflow-hidden rounded-full p-0.5 ring-1 transition-shadow md:size-24">
                {item.image?.url && (
                  <Image
                    data={item.image}
                    sizes="96px"
                    className="size-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
              </span>
              <span className="text-center text-xs tracking-wider uppercase">
                {item.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export const loader = featuredCollectionsLoader;

export const schema = createSchema({
  type: "collection-bubbles",
  title: "Collection bubbles",
  settings: [
    {
      group: "Collections",
      inputs: [
        {
          type: "collection-list",
          name: "collections",
          label: "Collections",
          shouldRevalidate: true,
        },
      ],
    },
    {
      group: "Layout",
      inputs: layoutInputs.filter(({ name }) => name !== "gap"),
    },
  ],
  presets: { verticalPadding: "small" },
});
