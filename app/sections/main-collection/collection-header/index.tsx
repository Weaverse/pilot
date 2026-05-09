import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import type { CollectionQuery } from "storefront-api.generated";
import { BreadCrumb } from "~/components/breadcrumb";
import { Image } from "~/components/image";
import { cn } from "~/utils/cn";

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

  let hasBanner = showBanner && Boolean(banner);

  return (
    <div {...rest} className="col-span-full py-10">
      {showBreadcrumb && (
        <BreadCrumb page={collection.title} className="mb-2.5" />
      )}
      <div
        className={cn(
          "flex flex-col gap-6",
          hasBanner && "lg:flex-row lg:items-center lg:gap-12",
        )}
      >
        <div className={cn("flex flex-col gap-5", hasBanner && "lg:flex-1")}>
          <h3>{collection.title}</h3>
          {showDescription && collection.description && (
            <p className="text-body-subtle max-w-lg">
              {collection.description}
            </p>
          )}
        </div>
        {hasBanner && (
          <div
            className={cn(
              "w-full shrink-0 overflow-hidden rounded-lg bg-gray-100",
              "h-(--banner-height-mobile) lg:h-(--banner-height-desktop)",
              "lg:w-1/2",
            )}
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
