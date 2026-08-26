import {
  createSchema,
  type HydrogenComponentProps,
  useParentInstance,
} from "@weaverse/hydrogen";
import { Icon } from "~/components/icon";
import { cn } from "~/utils/cn";

let ICONS = {
  globe: "globe-duotone",
  "map-pin": "map-pin-duotone",
  "pencil-line": "pencil-line-duotone",
  smiley: "smiley-duotone",
  "shield-check": "shield-check-duotone",
  star: "star-duotone",
  heart: "heart-duotone",
  clock: "clock-duotone",
  leaf: "leaf-duotone",
  package: "package-duotone",
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

  let iconName = ICONS[icon];

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
      {iconName && (
        <Icon name={iconName} className="size-6 shrink-0 text-slate-700" />
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
