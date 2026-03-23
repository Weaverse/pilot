import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { Filters } from "./filters";

interface CollectionFiltersData {
  sidebarWidth: number;
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
    sidebarWidth,
    expandFilters,
    showFiltersCount,
    enableSwatches,
    displayAsButtonFor,
    filterItemsLimit,
    ...rest
  } = props;

  return (
    <div
      ref={ref}
      {...rest}
      className="hidden shrink-0 lg:block"
      style={{ width: `${sidebarWidth}px` }}
    >
      <div
        className="sticky flex h-[calc(100vh-var(--height-nav)-20px)] flex-col gap-4 pt-6 pr-5"
        style={{ top: "calc(var(--height-nav))" }}
      >
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
          type: "range",
          name: "sidebarWidth",
          label: "Sidebar width",
          defaultValue: 288,
          configs: {
            min: 200,
            max: 400,
            step: 8,
            unit: "px",
          },
        },
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
