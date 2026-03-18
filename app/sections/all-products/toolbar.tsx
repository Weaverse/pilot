import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { BreadCrumb } from "~/components/breadcrumb";

interface AllProductsToolbarData {
  showBreadcrumb: boolean;
  showProductsCount: boolean;
}

interface AllProductsToolbarProps
  extends HydrogenComponentProps,
    AllProductsToolbarData {
  ref: React.Ref<HTMLDivElement>;
}

function AllProductsToolbar(props: AllProductsToolbarProps) {
  const { ref, showBreadcrumb, showProductsCount, ...rest } = props;

  return (
    <div ref={ref} {...rest}>
      <div className="border-gray-400 border-b py-4">
        <div className="flex w-full items-center justify-between gap-4 md:gap-8">
          <div className="hidden items-center gap-2 md:flex">
            {showBreadcrumb && <BreadCrumb page="All Products" />}
            {showProductsCount && (
              <span data-products-count className="text-foreground/60" />
            )}
          </div>
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
