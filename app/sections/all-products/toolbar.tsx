import {
  createSchema,
  type HydrogenComponentProps,
  useThemeText,
} from "@weaverse/hydrogen";
import { BreadCrumb } from "~/components/breadcrumb";
import { SortDropdown } from "~/components/product-grid/sort-dropdown";
import { useProductGridStore } from "~/components/product-grid/store";
import type { SortParam } from "~/types/others";

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
  const { t } = useThemeText();
  let displayedCount = useProductGridStore((s) => s.displayedCount);

  const sortOptions: Array<{ label: string; key: SortParam }> = [
    { label: t("collection.sortOptions.relevance"), key: "relevance" },
    { label: t("collection.sortOptions.priceLowHigh"), key: "price-low-high" },
    { label: t("collection.sortOptions.priceHighLow"), key: "price-high-low" },
    { label: t("collection.sortOptions.bestSelling"), key: "best-selling" },
    { label: t("collection.sortOptions.newest"), key: "newest" },
  ];

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
                  {t("collection.productsCount", { count: displayedCount })}
                </span>
              </>
            )}
          </div>
          {enableSort && <SortDropdown options={sortOptions} />}
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
