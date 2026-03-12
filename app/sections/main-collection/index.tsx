import { createSchema } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import type { CollectionQuery } from "storefront-api.generated";
import { layoutInputs, Section, type SectionProps } from "~/components/section";
import { cn } from "~/utils/cn";
import { MainCollectionProvider } from "./main-collection-context";

interface MainCollectionData {
  filtersPosition: "sidebar" | "drawer";
  enableFilter: boolean;
  productsPerRowDesktop: number;
  productsPerRowMobile: number;
}

interface MainCollectionProps extends SectionProps, MainCollectionData {
  ref: React.Ref<HTMLElement>;
}

export default function MainCollection(props: MainCollectionProps) {
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
        <MainCollectionProvider
          filtersPosition={filtersPosition}
          enableFilter={enableFilter}
          productsPerRowDesktop={Number(productsPerRowDesktop) || 3}
          productsPerRowMobile={Number(productsPerRowMobile) || 1}
        >
          <div
            className={cn(
              "grid gap-5",
              enableFilter && filtersPosition === "sidebar"
                ? "lg:grid-cols-[288px_1fr]"
                : "grid-cols-1",
            )}
          >
            {children}
          </div>
        </MainCollectionProvider>
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
  childTypes: ["mc--header", "mc--toolbar", "mc--filters", "mc--product-grid"],
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
          condition: (data: MainCollectionData) => data.enableFilter,
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
      { type: "mc--header" },
      { type: "mc--toolbar" },
      { type: "mc--filters" },
      { type: "mc--product-grid" },
    ],
  },
});
