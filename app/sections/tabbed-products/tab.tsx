import {
  createSchema,
  type WeaverseComponentProps,
} from "@weaverse/hydrogen/react-router";
import { useContext, useId } from "react";
import { ProductCard } from "~/components/product-card";
import { Swimlane } from "~/components/swimlane";
import {
  type FeaturedProductsLoaderData,
  type FeaturedProductsSectionData,
  loader as featuredProductsLoader,
  productSelectionInputs,
} from "../featured-products";
import { TabGroupContext } from "./index";

interface TabProps
  extends
    WeaverseComponentProps<FeaturedProductsLoaderData>,
    FeaturedProductsSectionData {
  ref?: React.Ref<HTMLLabelElement>;
  label: string;
}

export default function Tab(props: TabProps) {
  let {
    ref,
    label,
    loaderData,
    // Read by the loader only; kept off the DOM.
    selectionMethod: _selectionMethod,
    collection: _collection,
    products: _products,
    ...rest
  } = props;
  let group = useContext(TabGroupContext);
  let id = useId();

  // Three siblings in the section's flex row: radio, label (the tab, which
  // Studio selects) and panel.
  return (
    <>
      <input type="radio" name={group} id={id} className="peer sr-only" />
      <label
        ref={ref}
        {...rest}
        htmlFor={id}
        className="hover:text-body cursor-pointer pb-1 text-lg transition-colors peer-focus-visible:outline"
      >
        {label}
      </label>
      <div className="tab-panel">
        <Swimlane withArrows={false} className="gap-4">
          {loaderData?.products?.nodes?.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              className="w-80 snap-start"
            />
          ))}
        </Swimlane>
      </div>
    </>
  );
}

export const loader = featuredProductsLoader;

export const schema = createSchema({
  type: "tabbed-products--tab",
  title: "Tab",
  label: (data: TabProps) => data.label,
  settings: [
    {
      group: "Tab",
      inputs: [
        { type: "text", name: "label", label: "Label", defaultValue: "Tab" },
        ...productSelectionInputs,
      ],
    },
  ],
  presets: { label: "Tab", selectionMethod: "auto" },
});
