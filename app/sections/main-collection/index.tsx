import { createSchema } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import type { CollectionQuery } from "storefront-api.generated";
import { layoutInputs, Section, type SectionProps } from "~/components/section";

interface MainCollectionProps extends SectionProps {
  ref: React.Ref<HTMLElement>;
}

export default function MainCollection(props: MainCollectionProps) {
  const { ref, children, ...rest } = props;

  const { collection, collections } = useLoaderData<
    CollectionQuery & {
      collections: Array<{ handle: string; title: string }>;
    }
  >();

  if (collection?.products && collections) {
    return (
      <Section ref={ref} {...rest} overflow="unset" animate={false}>
        {children}
      </Section>
    );
  }
  return <Section ref={ref} {...rest} />;
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
        return inp.name !== "borderRadius" && inp.name !== "gap";
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
