import {
  ClockIcon,
  GlobeIcon,
  HeartIcon,
  LeafIcon,
  MapPinIcon,
  PackageIcon,
  PencilLineIcon,
  ShieldCheckIcon,
  SmileyIcon,
  StarIcon,
} from "@phosphor-icons/react";
import {
  createSchema,
  type HydrogenComponentProps,
  useParentInstance,
} from "@weaverse/hydrogen";
import { cn } from "~/utils/cn";

let ICONS = {
  globe: GlobeIcon,
  "map-pin": MapPinIcon,
  "pencil-line": PencilLineIcon,
  smiley: SmileyIcon,
  "shield-check": ShieldCheckIcon,
  star: StarIcon,
  heart: HeartIcon,
  clock: ClockIcon,
  leaf: LeafIcon,
  package: PackageIcon,
} as const;

type IconOption = keyof typeof ICONS;

interface HighlightItemProps extends HydrogenComponentProps {
  icon: IconOption;
  text: string;
}

export default function ProductHighlightItem(props: HighlightItemProps) {
  let { icon, text, ...rest } = props;
  let parent = useParentInstance();
  let isGrid = parent.data?.layout === "grid";

  if (!text) {
    return null;
  }

  let IconComponent = ICONS[icon];

  return (
    <div
      {...rest}
      className={cn(
        "flex gap-3",
        isGrid
          ? "flex-col items-center text-center rounded-lg border border-gray-300 px-2 py-3"
          : "items-center",
      )}
    >
      {IconComponent && (
        <IconComponent
          className="size-6 shrink-0 text-slate-700"
          weight="duotone"
        />
      )}
      <span>{text}</span>
    </div>
  );
}

export let schema = createSchema({
  type: "mp--highlight-item",
  title: "Highlight item",
  settings: [
    {
      group: "General",
      inputs: [
        {
          type: "text",
          label: "Text",
          name: "text",
          defaultValue: "Highlight text",
          placeholder: "Enter highlight text...",
        },
        {
          type: "select",
          label: "Icon",
          name: "icon",
          configs: {
            options: [
              { value: "globe", label: "Globe" },
              { value: "map-pin", label: "Map pin" },
              { value: "pencil-line", label: "Pencil" },
              { value: "smiley", label: "Smiley" },
              { value: "shield-check", label: "Shield check" },
              { value: "star", label: "Star" },
              { value: "heart", label: "Heart" },
              { value: "clock", label: "Clock" },
              { value: "leaf", label: "Leaf" },
              { value: "package", label: "Package" },
            ],
          },
          defaultValue: "globe",
        },
      ],
    },
  ],
});
