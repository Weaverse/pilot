import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { LayoutSwitcher } from "~/sections/main-collection/toolbar/layout-switcher";
import {
  useProductsGridSizeStore,
  useVisibleCountStore,
} from "~/stores/products-grid-size";

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
  const { gridSizeDesktop, gridSizeMobile, setGridSize } =
    useProductsGridSizeStore();
  const { visibleCount } = useVisibleCountStore();

  return (
    <div ref={ref} {...rest}>
      <div className="border-gray-400 border-b py-4">
        <div className="flex w-full items-center justify-between gap-4 md:gap-8">
          <LayoutSwitcher
            gridSizeDesktop={gridSizeDesktop}
            gridSizeMobile={gridSizeMobile}
            onGridSizeChange={setGridSize}
          />
          {showProductsCount && visibleCount > 0 && (
            <span className="hidden text-center md:inline">
              {visibleCount} products
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
