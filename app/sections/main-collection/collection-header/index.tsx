import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import clsx from "clsx";
import { useLoaderData } from "react-router";
import type { CollectionQuery } from "storefront-api.generated";
import { BreadCrumb } from "~/components/breadcrumb";
import { Image } from "~/components/image";

interface CollectionHeaderData {
  showBreadcrumb: boolean;
  showDescription: boolean;
  showBanner: boolean;
  bannerHeightDesktop: number;
  bannerHeightMobile: number;
}

interface CollectionHeaderProps
  extends HydrogenComponentProps,
    CollectionHeaderData {}

function CollectionHeader(props: CollectionHeaderProps) {
  const {
    showBreadcrumb,
    showDescription,
    showBanner,
    bannerHeightDesktop,
    bannerHeightMobile,
    ...rest
  } = props;

  const { collection } = useLoaderData<
    CollectionQuery & {
      collections: Array<{ handle: string; title: string }>;
    }
  >();

  if (!collection) {
    return null;
  }

  const banner = collection.metafield
    ? collection.metafield.reference.image
    : collection.image;

  return (
    <div {...rest} className="col-span-full py-10">
      {showBreadcrumb && (
        <BreadCrumb page={collection.title} className="mb-2.5" />
      )}
      <h3>{collection.title}</h3>
      {showDescription && collection.description && (
        <p className="mt-2.5 text-body-subtle">{collection.description}</p>
      )}
      {showBanner && banner && (
        <div
          className={clsx([
            "mt-6 overflow-hidden rounded-lg bg-gray-100",
            "h-(--banner-height-mobile) lg:h-(--banner-height-desktop)",
          ])}
          style={
            {
              "--banner-height-desktop": `${bannerHeightDesktop}px`,
              "--banner-height-mobile": `${bannerHeightMobile}px`,
            } as React.CSSProperties
          }
        >
          <Image data={banner} sizes="auto" width={2000} />
        </div>
      )}
    </div>
  );
}

export default CollectionHeader;

export const schema = createSchema({
  type: "mc--header",
  title: "Header",
  settings: [
    {
      group: "Header",
      inputs: [
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
          condition: (data: CollectionHeaderData) => data.showBanner,
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
          condition: (data: CollectionHeaderData) => data.showBanner,
        },
      ],
    },
  ],
});
