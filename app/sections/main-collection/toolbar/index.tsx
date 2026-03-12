import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useMainCollectionContext } from "../main-collection-context";
import { Toolbar } from "./toolbar";

interface CollectionToolbarData {
  enableSort: boolean;
  showProductsCount: boolean;
  enableFilter: boolean;
}

interface CollectionToolbarProps
  extends HydrogenComponentProps,
    CollectionToolbarData {
  ref: React.Ref<HTMLDivElement>;
}

function CollectionToolbar(props: CollectionToolbarProps) {
  const { ref, enableSort, showProductsCount, enableFilter, ...rest } = props;
  const {
    gridSizeDesktop,
    gridSizeMobile,
    setGridSizeDesktop,
    setGridSizeMobile,
  } = useMainCollectionContext();

  return (
    <div ref={ref} {...rest} className="col-span-full">
      <Toolbar
        enableSort={enableSort}
        showProductsCount={showProductsCount}
        enableFilter={enableFilter}
        gridSizeDesktop={gridSizeDesktop}
        gridSizeMobile={gridSizeMobile}
        onGridSizeChange={(v) => {
          if (v > 2) {
            setGridSizeDesktop(v);
          } else {
            setGridSizeMobile(v);
          }
        }}
      />
    </div>
  );
}

export default CollectionToolbar;

export const schema = createSchema({
  type: "mc--toolbar",
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
          name: "showProductsCount",
          label: "Show products count",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "enableFilter",
          label: "Enable filtering",
          defaultValue: true,
        },
      ],
    },
  ],
});
