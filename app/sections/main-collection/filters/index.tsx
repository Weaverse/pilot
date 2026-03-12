import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useMainCollectionContext } from "../main-collection-context";
import { Filters } from "./filters";

interface CollectionFiltersData {
  expandFilters: boolean;
  showFiltersCount: boolean;
  enableSwatches: boolean;
  displayAsButtonFor: string;
  filterItemsLimit: number;
}

interface CollectionFiltersProps
  extends HydrogenComponentProps,
    CollectionFiltersData {
  ref: React.Ref<HTMLDivElement>;
}

function CollectionFilters(props: CollectionFiltersProps) {
  const {
    ref,
    expandFilters,
    showFiltersCount,
    enableSwatches,
    displayAsButtonFor,
    filterItemsLimit,
    ...rest
  } = props;
  const { filtersPosition, enableFilter } = useMainCollectionContext();

  // This child only renders as sidebar; drawer mode is handled by the toolbar
  if (!enableFilter || filtersPosition !== "sidebar") {
    return null;
  }

  return (
    <div ref={ref} {...rest} className="hidden h-full pt-6 lg:block lg:pb-20">
      <div className="sticky top-[calc(var(--height-nav)+20px)] flex h-[calc(100vh-var(--height-nav)-40px)] flex-col gap-4 pr-5">
        <div className="font-bold">Filters</div>
        <Filters
          expandFilters={expandFilters}
          showFiltersCount={showFiltersCount}
          enableSwatches={enableSwatches}
          displayAsButtonFor={displayAsButtonFor}
          filterItemsLimit={filterItemsLimit}
        />
      </div>
    </div>
  );
}

export default CollectionFilters;

export const schema = createSchema({
  type: "mc--filters",
  title: "Filters",
  settings: [
    {
      group: "Filters",
      inputs: [
        {
          type: "switch",
          name: "expandFilters",
          label: "Expand filters",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "showFiltersCount",
          label: "Show filters count",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "enableSwatches",
          label: "Enable color/image swatches",
          defaultValue: true,
        },
        {
          type: "text",
          name: "displayAsButtonFor",
          label: "Display as button for:",
          defaultValue: "Size, More filters",
          helpText: "Comma-separated list of filters to display as buttons",
        },
        {
          type: "range",
          name: "filterItemsLimit",
          label: "Max visible filter items",
          defaultValue: 10,
          configs: {
            min: 3,
            max: 30,
            step: 1,
          },
          helpText:
            'Items beyond this limit are hidden behind a "Show more" toggle',
        },
      ],
    },
  ],
});
