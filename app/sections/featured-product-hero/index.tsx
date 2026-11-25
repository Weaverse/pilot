import { gql } from "@shopify/hydrogen";
import {
  createSchema,
  IMAGES_PLACEHOLDERS,
  type WeaverseComponentLoaderArgs,
  type WeaverseImage,
  type WeaverseProduct,
} from "@weaverse/hydrogen/react-router";
import { cva } from "class-variance-authority";
import { Image } from "~/components/image";
import { Overlay, type OverlayData, overlayInputs } from "~/components/overlay";
import { ProductCard } from "~/components/product-card";
import type { SectionProps } from "~/components/section";
import { Section } from "~/components/section";
import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
import { CACHE_DEFAULT } from "~/utils/cache";
import { unwrapStorefront } from "~/utils/storefront";

const FEATURED_PRODUCT_QUERY = gql(
  `
  query featuredProductHero($country: CountryCode, $language: LanguageCode, $handle: String!)
  @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductCard
    }
  }
`,
  [PRODUCT_CARD_FRAGMENT],
);

interface FeaturedProductHeroData extends OverlayData {
  image: WeaverseImage | string;
  product: WeaverseProduct;
  cardPosition: "left" | "right";
}

type FeaturedProductHeroProps = SectionProps<
  Awaited<ReturnType<typeof loader>>
> &
  FeaturedProductHeroData;

const layoutVariants = cva(
  "relative z-1 flex min-h-[80vh] flex-col justify-between gap-10 px-3 py-10 md:flex-row md:items-start md:px-10 md:py-16 lg:px-16",
  {
    variants: {
      cardPosition: {
        left: "md:flex-row-reverse",
        right: "",
      },
    },
    defaultVariants: { cardPosition: "right" },
  },
);

/**
 * A full-bleed lifestyle image with a headline and, on top of it, the
 * featured product's card (quick shop, price, swatches), so the banner sells
 * the product directly.
 */
export default function FeaturedProductHero(props: FeaturedProductHeroProps) {
  let {
    loaderData,
    image,
    product: _product,
    cardPosition,
    enableOverlay,
    overlayColor,
    overlayColorHover,
    overlayOpacity,
    children,
    ...rest
  } = props;
  let data = typeof image === "string" ? { url: image, altText: "" } : image;
  let product = loaderData?.product;

  return (
    <Section {...rest} width="full" verticalPadding="none">
      <div className="absolute inset-0 isolate">
        {data?.url && (
          <Image
            data={data}
            sizes="100vw"
            className="h-full w-full rounded-none object-cover"
          />
        )}
        <Overlay
          enableOverlay={enableOverlay}
          overlayColor={overlayColor}
          overlayColorHover={overlayColorHover}
          overlayOpacity={overlayOpacity}
          className="z-0"
        />
      </div>
      <div className={layoutVariants({ cardPosition })}>
        <div className="flex max-w-xl flex-col gap-4 text-white [&_.paragraph]:mx-[unset]">
          {children}
        </div>
        {product && (
          <div className="bg-background text-body w-full max-w-64 shrink-0 self-end p-3">
            <ProductCard product={product} />
          </div>
        )}
      </div>
    </Section>
  );
}

export async function loader({
  weaverse,
  data,
}: WeaverseComponentLoaderArgs<FeaturedProductHeroData>) {
  if (!data?.product?.handle) {
    return null;
  }
  return unwrapStorefront(
    await weaverse.storefront.graphql(FEATURED_PRODUCT_QUERY, {
      variables: { handle: data.product.handle },
      cache: CACHE_DEFAULT,
    }),
  );
}

export const schema = createSchema({
  type: "featured-product-hero",
  title: "Featured product hero",
  settings: [
    {
      group: "Content",
      inputs: [
        { type: "image", name: "image", label: "Background image" },
        {
          type: "product",
          name: "product",
          label: "Featured product",
          shouldRevalidate: true,
        },
        {
          type: "toggle-group",
          name: "cardPosition",
          label: "Product card position",
          configs: {
            options: [
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ],
          },
          defaultValue: "right",
        },
      ],
    },
    { group: "Overlay", inputs: overlayInputs },
  ],
  childTypes: ["subheading", "heading", "paragraph", "button"],
  presets: {
    image: IMAGES_PLACEHOLDERS.banner_1,
    cardPosition: "right",
    enableOverlay: true,
    overlayColor: "#0c0c0c",
    overlayOpacity: 30,
    children: [
      { type: "subheading", content: "Featured product", color: "#ffffff" },
      {
        type: "heading",
        content: "Light on the shoulders",
        as: "h2",
        color: "#ffffff",
        alignment: "left",
      },
      {
        type: "button",
        text: "Shop the jacket",
        variant: "custom",
        textColor: "#000000",
        backgroundColor: "#ffffff",
        backgroundColorHover: "#e9e9e9",
      },
    ],
  },
});
