import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";

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

  return (
    <div ref={ref} {...rest}>
      <div className="border-gray-400 border-b py-4">
        <div className="flex w-full items-center justify-between gap-4 md:gap-8">
          {showProductsCount && (
            <span
              data-products-count
              className="hidden text-center md:inline"
            />
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
