import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { BreadCrumb } from "~/components/breadcrumb";
import { SortDropdown } from "~/components/product-grid/sort-dropdown";
import { useProductGridStore } from "~/components/product-grid/store";
import type { SortParam } from "~/types/others";

const SORT_OPTIONS: Array<{ label: string; key: SortParam }> = [
  { label: "Relevance", key: "relevance" },
  { label: "Price, (low to high)", key: "price-low-high" },
  { label: "Price, (high to low)", key: "price-high-low" },
  { label: "Best selling", key: "best-selling" },
  { label: "Newest", key: "newest" },
];

interface AllProductsToolbarData {
  enableSort: boolean;
  showBreadcrumb: boolean;
  showProductsCount: boolean;
}

interface AllProductsToolbarProps
  extends HydrogenComponentProps,
    AllProductsToolbarData {}

function AllProductsToolbar(props: AllProductsToolbarProps) {
  const { enableSort, showBreadcrumb, showProductsCount, ...rest } = props;
  let displayedCount = useProductGridStore((s) => s.displayedCount);

  return (
    <div {...rest}>
      <div className="border-gray-400 border-b py-4">
        <div className="flex w-full items-center justify-between gap-4 md:gap-8">
          <div className="hidden items-center gap-2 md:flex">
            {showBreadcrumb && <BreadCrumb page="All Products" />}
            {showProductsCount && displayedCount > 0 && (
              <>
                <span className="text-foreground/60">·</span>
                <span className="text-foreground/60">
                  {displayedCount} products
                </span>
              </>
            )}
          </div>
          {enableSort && <SortDropdown options={SORT_OPTIONS} />}
        </div>
      </div>
    </div>
  );
}

export default AllProductsToolbar;

export const schema = createSchema({
  type: "ap--toolbar",
  title: "Toolbar",
  settings: [
    {
      group: "Toolbar",
      inputs: [
        {
          type: "switch",
          name: "enableSort",
          label: "Enable sorting",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "showBreadcrumb",
          label: "Show breadcrumb",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "showProductsCount",
          label: "Show products count",
          defaultValue: true,
        },
      ],
    },
  ],
});
