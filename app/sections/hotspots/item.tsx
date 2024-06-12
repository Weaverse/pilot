import { Image, Money } from "@shopify/hydrogen";
import type { MediaImage } from "@shopify/hydrogen/storefront-api-types";
import type {
  ComponentLoaderArgs,
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseProduct,
} from "@weaverse/hydrogen";
import clsx from "clsx";
import type { CSSProperties } from "react";
import { forwardRef } from "react";
import type { ProductQuery } from "storefrontapi.generated";
import { IconCircle, IconHandBag, IconPlus, IconTag } from "~/components/Icons";
import { PRODUCT_QUERY } from "~/data/queries";
import { Link } from "~/modules";

interface HotspotsItemData {
  icon: "circle" | "plus" | "bag" | "tag";
  iconSize: number;
  offsetX: number;
  offsetY: number;
  product: WeaverseProduct;
  popupWidth: number;
  showPrice: boolean;
  showViewDetailsLink: boolean;
  viewDetailsLinkText: string;
}

interface HotspotsItemProps
  extends HydrogenComponentProps<Awaited<ReturnType<typeof loader>>>,
    HotspotsItemData {}

const ICONS = {
  circle: IconCircle,
  plus: IconPlus,
  bag: IconHandBag,
  tag: IconTag,
};

let HotspotsItem = forwardRef<HTMLDivElement, HotspotsItemProps>(
  (props, ref) => {
    let {
      icon,
      iconSize,
      offsetX,
      offsetY,
      product,
      popupWidth,
      showPrice,
      showViewDetailsLink,
      viewDetailsLinkText,
      children,
      loaderData,
      ...rest
    } = props;
    let Icon = ICONS[icon];

    return (
      <div
        ref={ref}
        {...rest}
        className="absolute -translate-x-1/2 -translate-y-1/2 hover:z-[1]"
        style={
          {
            top: `${offsetY}%`,
            left: `${offsetX}%`,
            "--translate-x-ratio": offsetX > 50 ? 1 : -1,
            "--translate-y-ratio": offsetY > 50 ? 1 : -1,
            "--spot-size": `${iconSize + 16}px`,
          } as CSSProperties
        }
      >
        <div className="relative flex cursor-pointer">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-700 opacity-75"
            style={{ animationDuration: "1500ms" }}
          />
          <span className="relative inline-flex rounded-full p-2 bg-white group">
            <Icon style={{ width: iconSize, height: iconSize }} />
            <ProductPopup
              product={loaderData?.product}
              popupWidth={popupWidth}
              offsetX={offsetX}
              offsetY={offsetY}
              showPrice={showPrice}
              showViewDetailsLink={showViewDetailsLink}
              viewDetailsLinkText={viewDetailsLinkText}
            />
          </span>
        </div>
      </div>
    );
  },
);

interface ProductPopupProps
  extends Omit<HotspotsItemData, "icon" | "iconSize" | "product"> {
  product?: ProductQuery["product"];
}

function ProductPopup({
  product,
  popupWidth,
  offsetX,
  offsetY,
  showPrice,
  showViewDetailsLink,
  viewDetailsLinkText,
}: ProductPopupProps) {
  if (!product) {
    return null;
  }

  let featuredMedia = product.media.nodes.find(
    (node) => node.__typename === "MediaImage",
  ) as MediaImage;
  let featuredImage = featuredMedia?.image;
  let price = product.variants.nodes[0].price;
  let compareAtPrice = product.variants.nodes[0].compareAtPrice;

  return (
    <div
      className={clsx(
        "absolute z-10 py-1.5 text-sm sm:text-base transition-all",
        "invisible opacity-0",
        "w-40 sm:w-[var(--popup-width)]",
        "translate-x-[calc(var(--translate-x-ratio)*var(--spot-size))]",
        "translate-y-[calc(var(--translate-y-ratio)*-16px)]",
        "group-hover:visible group-hover:opacity-100",
        "group-hover:translate-x-[calc(var(--translate-x-ratio)*var(--spot-size))]",
        "group-hover:translate-y-0",
      )}
      style={
        {
          "--translate-x-ratio": offsetX > 50 ? 1 : -1,
          "--translate-y-ratio": offsetY > 50 ? 1 : -1,
          "--popup-width": `${popupWidth}px`,
          top: offsetY > 50 ? "auto" : "100%",
          bottom: offsetY > 50 ? "100%" : "auto",
          left: offsetX > 50 ? "auto" : "100%",
          right: offsetX > 50 ? "100%" : "auto",
        } as CSSProperties
      }
    >
      <div className="p-2.5 bg-white shadow-lg flex flex-col sm:flex-row gap-3">
        {featuredImage && (
          <div className="w-full sm:w-28 h-auto">
            <Image data={featuredImage} alt={product.title} />
          </div>
        )}
        <div className="flex flex-col gap-2 py-2 font-sans">
          <div>
            <div className="font-semibold">{product.title}</div>
            {showPrice && (
              <div className="flex items-center gap-1.5">
                {compareAtPrice && (
                  <Money
                    withoutTrailingZeros
                    data={compareAtPrice}
                    as="div"
                    className="text-base font-medium line-through text-gray-400"
                  />
                )}
                <Money
                  withoutTrailingZeros
                  data={price}
                  as="div"
                  className="text-base font-medium"
                />
              </div>
            )}
          </div>
          {showViewDetailsLink && (
            <Link
              to={`/products/${product.handle}`}
              className="underline-offset-4 underline text-sm"
            >
              {viewDetailsLinkText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default HotspotsItem;

export let loader = async (args: ComponentLoaderArgs<HotspotsItemData>) => {
  let { weaverse, data } = args;
  let { storefront } = weaverse;
  if (!data?.product) {
    return null;
  }
  let productHandle = data.product.handle;
  let { product } = await storefront.query<ProductQuery>(PRODUCT_QUERY, {
    variables: {
      handle: productHandle,
      selectedOptions: [],
      language: storefront.i18n.language,
      country: storefront.i18n.country,
    },
  });

  return { product };
};

export let schema: HydrogenComponentSchema = {
  type: "hotspots--item",
  title: "Hotspots item",
  toolbar: ["general-settings", ["duplicate", "delete"]],
  inspector: [
    {
      group: "Icon",
      inputs: [
        {
          type: "toggle-group",
          name: "icon",
          label: "Icon",
          configs: {
            options: [
              {
                label: "Circle",
                value: "circle",
                icon: "circle",
              },
              {
                label: "Plus",
                value: "plus",
                icon: "plus",
              },
              {
                label: "Bag",
                value: "bag",
                icon: "shopping-bag",
              },
              {
                label: "Tag",
                value: "tag",
                icon: "tag",
              },
            ],
          },
          defaultValue: "plus",
        },
        {
          type: "range",
          name: "iconSize",
          label: "Icon size",
          configs: {
            min: 16,
            max: 32,
            step: 2,
            unit: "px",
          },
          defaultValue: 20,
        },
        {
          type: "range",
          name: "offsetX",
          label: "Offset X",
          configs: {
            min: 0,
            max: 100,
            step: 1,
            unit: "%",
          },
          defaultValue: 50,
        },
        {
          type: "range",
          name: "offsetY",
          label: "Offset Y",
          configs: {
            min: 0,
            max: 100,
            step: 1,
            unit: "%",
          },
          defaultValue: 50,
        },
      ],
    },
    {
      group: "Product",
      inputs: [
        {
          type: "product",
          name: "product",
          label: "Product",
        },
        {
          type: "range",
          name: "popupWidth",
          label: "Popup width",
          configs: {
            min: 300,
            max: 600,
            step: 10,
            unit: "px",
          },
          defaultValue: 400,
          helpText: "For desktop devices only",
        },
        {
          type: "switch",
          name: "showPrice",
          label: "Show price",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "showViewDetailsLink",
          label: "Show view details link",
          defaultValue: true,
        },
        {
          type: "text",
          name: "viewDetailsLinkText",
          label: "View details link text",
          defaultValue: "View full details",
          condition: "showViewDetailsLink.eq.true",
        },
      ],
    },
  ],
};
