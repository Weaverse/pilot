import { createSchema } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import type { CollectionQuery } from "storefront-api.generated";
import { layoutInputs, Section, type SectionProps } from "~/components/section";
import { CollectionFiltersProvider } from "./collection-filters-context";

interface CollectionFiltersData {
  filtersPosition: "sidebar" | "drawer";
  enableFilter: boolean;
  productsPerRowDesktop: number;
  productsPerRowMobile: number;
}

interface CollectionFiltersProps extends SectionProps, CollectionFiltersData {
  ref: React.Ref<HTMLElement>;
}

export default function CollectionFilters(props: CollectionFiltersProps) {
  const {
    ref,
    children,
    filtersPosition,
    enableFilter,
    productsPerRowDesktop,
    productsPerRowMobile,
    ...rest
  } = props;

  const { collection, collections } = useLoaderData<
    CollectionQuery & {
      collections: Array<{ handle: string; title: string }>;
    }
  >();

  if (collection?.products && collections) {
    return (
      <Section ref={ref} {...rest} overflow="unset" animate={false}>
        <CollectionFiltersProvider
          filtersPosition={filtersPosition}
          enableFilter={enableFilter}
          productsPerRowDesktop={Number(productsPerRowDesktop) || 3}
          productsPerRowMobile={Number(productsPerRowMobile) || 1}
        >
          <div className="space-y-0">{children}</div>
        </CollectionFiltersProvider>
      </Section>
    );
  }
  return <Section ref={ref} {...rest} />;
}

export const schema = createSchema({
  type: "collection-filters",
  title: "Collection filters",
  limit: 1,
  enabledOn: {
    pages: ["COLLECTION"],
  },
  childTypes: [
    "cf--banner",
    "cf--toolbar",
    "cf--filters",
    "cf--product-pagination",
  ],
  settings: [
    {
      group: "Layout",
      inputs: [
        ...layoutInputs.filter((inp) => {
          return inp.name !== "borderRadius" && inp.name !== "gap";
        }),
        {
          type: "switch",
          name: "enableFilter",
          label: "Enable filtering",
          defaultValue: true,
        },
        {
          type: "select",
          name: "filtersPosition",
          label: "Filters position",
          configs: {
            options: [
              { value: "sidebar", label: "Sidebar" },
              { value: "drawer", label: "Drawer" },
            ],
          },
          defaultValue: "sidebar",
          condition: (data: CollectionFiltersData) => data.enableFilter,
        },
        {
          type: "select",
          name: "productsPerRowDesktop",
          label: "Default products per row (desktop)",
          configs: {
            options: [
              { value: "3", label: "3" },
              { value: "4", label: "4" },
              { value: "5", label: "5" },
            ],
          },
          defaultValue: "3",
        },
        {
          type: "select",
          name: "productsPerRowMobile",
          label: "Default products per row (mobile)",
          configs: {
            options: [
              { value: "1", label: "1" },
              { value: "2", label: "2" },
            ],
          },
          defaultValue: "1",
        },
      ],
    },
  ],
  presets: {
    children: [
      { type: "cf--banner" },
      { type: "cf--toolbar" },
      { type: "cf--filters" },
      { type: "cf--product-pagination" },
    ],
  },
});
