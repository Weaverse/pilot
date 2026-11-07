import { createSchema } from "@weaverse/hydrogen/react-router";
import { useLoaderData } from "react-router";
import type { CollectionQuery } from "~/routes/collections/collection-query";
import { layoutInputs, Section, type SectionProps } from "~/components/section";

interface MainCollectionProps extends SectionProps {}

export default function MainCollection(props: MainCollectionProps) {
  const { children, ...rest } = props;

  const { collection, collections } = useLoaderData<
    CollectionQuery & {
      collections: Array<{ handle: string; title: string }>;
    }
  >();

  if (collection?.products && collections) {
    return (
      <Section {...rest} overflow="unset" animate={false}>
        {children}
      </Section>
    );
  }
  return <Section {...rest} />;
}

export const schema = createSchema({
  type: "main-collection",
  title: "Main collection",
  limit: 1,
  enabledOn: {
    pages: ["COLLECTION"],
  },
  childTypes: ["mc--header", "mc--toolbar", "mc--content"],
  settings: [
    {
      group: "Layout",
      inputs: layoutInputs.filter((inp) => {
        return inp.name !== "gap";
      }),
    },
  ],
  presets: {
    width: "stretch",
    children: [
      { type: "mc--header" },
      { type: "mc--toolbar" },
      { type: "mc--content" },
    ],
  },
});
