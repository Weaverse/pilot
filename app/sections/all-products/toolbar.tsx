import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import type { AllProductsQuery } from "storefront-api.generated";
import { LayoutSwitcher } from "~/sections/main-collection/toolbar/layout-switcher";
import { useProductsGridSizeStore } from "~/stores/products-grid-size";

interface AllProductsToolbarData {
  showProductsCount: boolean;
}

interface AllProductsToolbarProps
  extends HydrogenComponentProps,
    AllProductsToolbarData {
  ref: React.Ref<HTMLDivElement>;
}

function AllProductsToolbar(props: AllProductsToolbarProps) {
  const { ref, showProductsCount, ...rest } = props;
  const { products } = useLoaderData<AllProductsQuery>();
  const gridSizeDesktop = useProductsGridSizeStore(
    (state) => state.gridSizeDesktop,
  );
  const gridSizeMobile = useProductsGridSizeStore(
    (state) => state.gridSizeMobile,
  );
  const setGridSize = useProductsGridSizeStore((state) => state.setGridSize);

  return (
    <div ref={ref} {...rest}>
      <div className="border-line-subtle border-y py-4">
        <div className="flex w-full items-center justify-between gap-4 md:gap-8">
          <LayoutSwitcher
            gridSizeDesktop={gridSizeDesktop}
            gridSizeMobile={gridSizeMobile}
            onGridSizeChange={setGridSize}
          />
          {showProductsCount && (
            <span className="hidden text-center md:inline">
              {products?.nodes.length} products
            </span>
          )}
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
          name: "showProductsCount",
          label: "Show products count",
          defaultValue: true,
        },
      ],
    },
  ],
});
