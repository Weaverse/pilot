import {
  GiftIcon,
  MegaphoneIcon,
  TagIcon,
  TruckIcon,
} from "@phosphor-icons/react";
import { Image } from "@shopify/hydrogen";
import {
  createSchema,
  type HydrogenComponentProps,
  type WeaverseImage,
} from "@weaverse/hydrogen";
import { cn } from "~/utils/cn";

let ICONS = {
  gift: GiftIcon,
  tag: TagIcon,
  megaphone: MegaphoneIcon,
  truck: TruckIcon,
} as const;

type IconOption = keyof typeof ICONS;

interface ProductPromoTextProps extends HydrogenComponentProps {
  ref: React.Ref<HTMLDivElement>;
  text: string;
  icon: IconOption;
  customIcon: WeaverseImage;
  textColor: string;
  backgroundColor: string;
}

export default function ProductPromoText(props: ProductPromoTextProps) {
  let { text, icon, customIcon, textColor, backgroundColor, ...rest } = props;

  if (!text) {
    return null;
  }

  let IconComponent = ICONS[icon];

  return (
    <div
      {...rest}
      className={cn(
        "flex items-center gap-2 rounded-md px-4 py-3 text-sm font-medium",
      )}
      style={{ color: textColor, backgroundColor }}
    >
      {customIcon?.url ? (
        <Image
          data={customIcon}
          width={20}
          height={20}
          className="size-5 shrink-0 object-contain"
        />
      ) : IconComponent ? (
        <IconComponent className="size-5 shrink-0" />
      ) : null}
      {text}
    </div>
  );
}

export let schema = createSchema({
  type: "mp--promo-text",
  title: "Promo text",
  limit: 1,
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [
    {
      group: "General",
      inputs: [
        {
          type: "text",
          label: "Text",
          name: "text",
          defaultValue: "Holidays Sale: Up To 20% OFF Sitewide!",
          placeholder: "Enter promotion text...",
        },
        {
          type: "select",
          label: "Icon",
          name: "icon",
          configs: {
            options: [
              { value: "gift", label: "Gift" },
              { value: "tag", label: "Tag" },
              { value: "megaphone", label: "Megaphone" },
              { value: "truck", label: "Truck" },
            ],
          },
          defaultValue: "gift",
        },
        {
          type: "image",
          label: "Custom icon",
          name: "customIcon",
          helpText: "Upload a custom image to override the default icon.",
        },
        {
          type: "color",
          label: "Text color",
          name: "textColor",
        },
        {
          type: "color",
          label: "Background color",
          name: "backgroundColor",
          defaultValue: "#f5e1e7",
        },
      ],
    },
  ],
});
