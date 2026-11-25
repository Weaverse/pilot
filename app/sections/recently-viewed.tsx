import { createSchema } from "@weaverse/hydrogen/react-router";
import { useEffect } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { ProductCard } from "~/components/product-card";
import { layoutInputs, Section, type SectionProps } from "~/components/section";
import { Swimlane } from "~/components/swimlane";
import type { ProductCardFragment } from "~/graphql/fragments";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import { useWeaverseStudioCheck } from "~/hooks/use-weaverse-studio-check";
import { getRecentlyViewed } from "~/utils/recently-viewed";

interface RecentlyViewedProps extends SectionProps {
  productsCount: number;
}

/**
 * Products the shopper viewed before, read from this browser's storage
 * (product pages record each visit). The current product is left out, and
 * the section renders nothing on the storefront until there is a product to
 * show.
 */
export default function RecentlyViewed(props: RecentlyViewedProps) {
  let { productsCount = 8, children, ...rest } = props;
  let fetcher = useFetcher<{ products: ProductCardFragment[] }>();
  let currentId = useLoaderData<{ product?: { id: string } }>()?.product?.id;
  let endpoint = usePrefixPathWithLocale("/api/recently-viewed");
  let isDesignMode = useWeaverseStudioCheck();
  let { load } = fetcher;

  useEffect(() => {
    let ids = getRecentlyViewed()
      .filter((id) => id !== currentId)
      .slice(0, productsCount);
    if (ids.length) {
      load(`${endpoint}?ids=${encodeURIComponent(ids.join(","))}`);
    }
  }, [currentId, productsCount, endpoint, load]);

  let products = fetcher.data?.products ?? [];
  if (!products.length && !isDesignMode) {
    return null;
  }

  return (
    <Section {...rest}>
      {children}
      {products.length ? (
        <Swimlane withArrows>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Swimlane>
      ) : (
        <p className="text-body-subtle">
          Products a shopper has viewed show here. The section stays hidden on
          the storefront until they have viewed one.
        </p>
      )}
    </Section>
  );
}

export const schema = createSchema({
  type: "recently-viewed",
  title: "Recently viewed",
  limit: 1,
  childTypes: ["subheading", "heading", "paragraph"],
  settings: [
    {
      group: "Products",
      inputs: [
        {
          type: "range",
          name: "productsCount",
          label: "Products to show",
          configs: { min: 2, max: 12, step: 1 },
          defaultValue: 8,
        },
      ],
    },
    {
      group: "Layout",
      inputs: layoutInputs.filter((i) => i.name !== "borderRadius"),
    },
  ],
  presets: {
    productsCount: 8,
    gap: 22,
    verticalPadding: "small",
    children: [{ type: "heading", content: "Recently viewed", as: "h4" }],
  },
});
