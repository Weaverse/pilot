import { useLoaderData } from "@remix-run/react";
import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef, useEffect, useState } from "react";
import type { CollectionDetailsQuery } from "storefrontapi.generated";
import Link from "~/components/link";
import { Section, type SectionProps, layoutInputs } from "~/components/section";
import { Filters } from "./filters";
import { ProductsPagination } from "./products-pagination";
import { ToolsBar } from "./tools-bar";
import { Image } from "@shopify/hydrogen";

export interface CollectionFiltersData {
  showBreadcrumb: boolean;
  showDescription: boolean;
  showBanner: boolean;
  bannerHeightDesktop: number;
  bannerHeightMobile: number;
  enableSort: boolean;
  showProductsCount: boolean;
  enableFilter: boolean;
  filtersPosition: "sidebar" | "drawer";
  expandFilters: boolean;
  showFiltersCount: boolean;
  enableColorSwatch: boolean;
  displayAsButtonFor: string;
  productsPerRowDesktop: number;
  productsPerRowMobile: number;
  loadPrevText: string;
  loadMoreText: string;
}

interface CollectionFiltersProps extends SectionProps, CollectionFiltersData {}

let CollectionFilters = forwardRef<HTMLElement, CollectionFiltersProps>(
  (props, sectionRef) => {
    let {
      showBreadcrumb,
      showDescription,
      showBanner,
      bannerHeightDesktop,
      bannerHeightMobile,
      enableSort,
      showFiltersCount,
      enableFilter,
      filtersPosition,
      expandFilters,
      showProductsCount,
      enableColorSwatch,
      displayAsButtonFor,
      productsPerRowDesktop,
      productsPerRowMobile,
      loadPrevText,
      loadMoreText,
      ...rest
    } = props;
    let { collection, collections } = useLoaderData<
      CollectionDetailsQuery & {
        collections: Array<{ handle: string; title: string }>;
      }
    >();

    let [gridSizeDesktop, setGridSizeDesktop] = useState(
      Number(productsPerRowDesktop) || 3,
    );
    let [gridSizeMobile, setGridSizeMobile] = useState(
      Number(productsPerRowMobile) || 1,
    );

    useEffect(() => {
      setGridSizeDesktop(Number(productsPerRowDesktop) || 3);
      setGridSizeMobile(Number(productsPerRowMobile) || 1);
    }, [productsPerRowDesktop, productsPerRowMobile]);

    if (collection?.products && collections) {
      let banner = collection.metafield
        ? collection.metafield.reference.image
        : collection.image;
      return (
        <Section ref={sectionRef} {...rest} overflow="unset">
          <div className="py-10">
            {showBreadcrumb && (
              <div className="flex items-center gap-2 text-body-subtle mb-2.5">
                <Link to="/" className="hover:underline underline-offset-4">
                  Home
                </Link>
                <span>/</span>
                <span>{collection.title}</span>
              </div>
            )}
            <h3>{collection.title}</h3>
            {showDescription && collection.description && (
              <p className="text-body-subtle mt-2.5">
                {collection.description}
              </p>
            )}
            {showBanner && banner && (
              <div
                className="relative h-[--banner-height-mobile] lg:h-[--banner-height-desktop] mt-6"
                style={
                  {
                    "--banner-height-desktop": `${bannerHeightDesktop}px`,
                    "--banner-height-mobile": `${bannerHeightMobile}px`,
                  } as React.CSSProperties
                }
              >
                <Image
                  data={banner}
                  sizes="auto"
                  className="w-full h-full object-cover object-center"
                  width={2000}
                  height={2000}
                />
              </div>
            )}
          </div>
          <ToolsBar
            width={rest.width}
            gridSizeDesktop={gridSizeDesktop}
            gridSizeMobile={gridSizeMobile}
            onGridSizeChange={(v) => {
              if (v > 2) {
                setGridSizeDesktop(v);
              } else {
                setGridSizeMobile(v);
              }
            }}
            {...props}
          />
          <div className="flex gap-8 pt-6 lg:pt-12 pb-8 lg:pb-20">
            {enableFilter && filtersPosition === "sidebar" && (
              <div className="hidden lg:block shrink-0 w-72 space-y-4">
                <div className="font-bold">Filters</div>
                <Filters />
              </div>
            )}
            <ProductsPagination
              gridSizeDesktop={gridSizeDesktop}
              gridSizeMobile={gridSizeMobile}
              loadPrevText={loadPrevText}
              loadMoreText={loadMoreText}
            />
          </div>
        </Section>
      );
    }
    return <Section ref={sectionRef} {...rest} />;
  },
);

export default CollectionFilters;

export let schema: HydrogenComponentSchema = {
  type: "collection-filters",
  title: "Collection filters",
  limit: 1,
  enabledOn: {
    pages: ["COLLECTION"],
  },
  inspector: [
    {
      group: "Layout",
      inputs: [
        ...layoutInputs.filter((inp) => {
          return inp.name !== "borderRadius" && inp.name !== "gap";
        }),
        {
          type: "switch",
          name: "showBreadcrumb",
          label: "Show breadcrumb",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "showDescription",
          label: "Show description",
          defaultValue: false,
        },
        {
          type: "switch",
          name: "showBanner",
          label: "Show banner",
          defaultValue: true,
          helpText:
            "A custom banner can be stored under `custom.collection_banner` metafield.",
        },
        {
          type: "range",
          name: "bannerHeightDesktop",
          label: "Banner height (desktop)",
          defaultValue: 350,
          configs: {
            min: 100,
            max: 600,
            step: 1,
          },
          condition: "showBanner.eq.true",
        },
        {
          type: "range",
          name: "bannerHeightMobile",
          label: "Banner height (mobile)",
          defaultValue: 200,
          configs: {
            min: 50,
            max: 400,
            step: 1,
          },
          condition: "showBanner.eq.true",
        },
      ],
    },
    {
      group: "Filtering and sorting",
      inputs: [
        {
          type: "switch",
          name: "enableSort",
          label: "Enable sorting",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "showProductsCount",
          label: "Show products count",
          defaultValue: true,
        },
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
          condition: "enableFilter.eq.true",
        },
        {
          type: "switch",
          name: "expandFilters",
          label: "Expand filters",
          defaultValue: true,
          condition: "enableFilter.eq.true",
        },
        {
          type: "switch",
          name: "showFiltersCount",
          label: "Show filters count",
          defaultValue: true,
          condition: "enableFilter.eq.true",
        },
        {
          type: "switch",
          name: "enableColorSwatch",
          label: "Enable color swatches",
          defaultValue: true,
          condition: "enableFilter.eq.true",
        },
        {
          type: "text",
          name: "displayAsButtonFor",
          label: "Display as button for:",
          defaultValue: "Size, More filters",
          condition: "enableFilter.eq.true",
          helpText: "Comma-separated list of filters to display as buttons",
        },
      ],
    },
    {
      group: "Products",
      inputs: [
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
        {
          type: "text",
          name: "loadPrevText",
          label: "Load previous text",
          defaultValue: "Load previous",
          placeholder: "Load previous",
        },
        {
          type: "text",
          name: "loadMoreText",
          label: "Load more text",
          defaultValue: "Load more products",
          placeholder: "Load more products",
        },
      ],
    },
  ],
};
