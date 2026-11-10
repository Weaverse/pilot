import { getSortByValue } from "@shopify/hydrogen";
import {
  createSchema,
  type WeaverseComponentProps,
  useTranslation,
} from "@weaverse/hydrogen/react-router";
import { BreadCrumb } from "~/components/breadcrumb";
import { SortDropdown } from "~/components/product-grid/sort-dropdown";
import { useProductGridStore } from "~/components/product-grid/store";

interface AllProductsToolbarData {
  enableSort: boolean;
  showBreadcrumb: boolean;
  showProductsCount: boolean;
}

interface AllProductsToolbarProps
  extends WeaverseComponentProps, AllProductsToolbarData {}

function AllProductsToolbar(props: AllProductsToolbarProps) {
  const { enableSort, showBreadcrumb, showProductsCount, ...rest } = props;
  const { t } = useTranslation();
  let displayedCount = useProductGridStore((s) => s.displayedCount);

  const sortOptions = [
    {
      label: t("collection.sortOptions.relevance"),
      value: getSortByValue("RELEVANCE", false),
    },
    {
      label: t("collection.sortOptions.priceLowHigh"),
      value: getSortByValue("PRICE", false),
    },
    {
      label: t("collection.sortOptions.priceHighLow"),
      value: getSortByValue("PRICE", true),
    },
    {
      label: t("collection.sortOptions.bestSelling"),
      value: getSortByValue("BEST_SELLING", false),
    },
    {
      label: t("collection.sortOptions.newest"),
      value: getSortByValue("CREATED", true),
    },
  ];

  return (
    <div {...rest}>
      <div className="border-b border-gray-400 py-4">
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
