import { type VariantProps, cva } from "class-variance-authority";
import { Filters } from "./filters";
import { LayoutSwitcher } from "./layout-switcher";
import { Sort } from "./sort";
import { cn } from "~/lib/cn";

let variants = cva("", {
  variants: {
    width: {
      full: "",
      stretch: "-mx-3 px-3 md:-mx-10 md:px-10 lg:-mx-16 lg:px-16",
      fixed: [
        "-mx-3 px-3 md:-mx-10 md:px-10",
        "lg:-mx-[max(calc((100vw-var(--page-width))/2),1.5rem)]",
        "lg:px-[max(calc((100vw-var(--page-width))/2),1.5rem)]",
      ],
    },
  },
});

interface ToolsBarProps extends VariantProps<typeof variants> {
  productsCount?: number;
  showSearchSort?: boolean;
  numberInRow?: number;
  onLayoutChange: (number: number) => void;
}

export function ToolsBar({
  width,
  numberInRow,
  productsCount = 0,
  showSearchSort = false,
  onLayoutChange,
}: ToolsBarProps) {
  return (
    <div
      className={cn("border-y border-line-subtle py-4", variants({ width }))}
    >
      <div className="gap-4 md:gap-8 flex w-full items-center justify-between">
        <LayoutSwitcher
          value={numberInRow}
          onChange={onLayoutChange}
          className="grow"
        />
        <span className="flex-1 text-center">{productsCount} Products</span>
        <div className="flex gap-2 flex-1 justify-end">
          <Sort show={showSearchSort} />
          <Filters />
        </div>
      </div>
    </div>
  );
}
