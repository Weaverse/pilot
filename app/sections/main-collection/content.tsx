import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import type { ReactNode } from "react";

interface CollectionContentProps
  extends Omit<HydrogenComponentProps, "children"> {
  ref: React.Ref<HTMLDivElement>;
  children: ReactNode;
}

function CollectionContent(props: CollectionContentProps) {
  const { children, ...rest } = props;

  return (
    <div
            {...rest}
      className="col-span-full flex flex-col gap-5 lg:flex-row"
    >
      {children}
    </div>
  );
}

export default CollectionContent;

export const schema = createSchema({
  type: "mc--content",
  title: "Content",
  childTypes: ["mc--filters", "mc--product-grid"],
  presets: {
    children: [{ type: "mc--filters" }, { type: "mc--product-grid" }],
  },
});
