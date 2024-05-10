import type { Product } from "@shopify/hydrogen/storefront-api-types";

// Demo store placeholders
const PLACEHOLDERS = {
  PRODUCT_INFO: [
    {
      title: "Description",
      content:
        "We threw snow tires on our core classics... Good for all year round! Named after my favorite football match of the year. Just like any of our joints, dress them up or down...",
    },
    {
      title: "Size and Fit",
      content:
        "We threw snow tires on our core classics... Good for all year round! Named after my favorite football match of the year. Just like any of our joints, dress them up or down...",
    },
    {
      title: "Delivery and Returns",
      content: `The towels had been hanging from the rod for years. They were stained and worn, and quite frankly, just plain ugly. Debra didn't want to touch them but she really didn't have a choice. It was important for her to see what was living within them. Patrick didn't want to go. The fact that she was insisting they must go made him want to go even less. He had no desire to make small talk with strangers he would never again see just to be polite. But she insisted that Patrick go, and she would soon find out that this would be the biggest mistake she could make in their relationship.`,
    },
  ],
  PRODUCT: {
    label: "Limited Edition",
    id: "gid://shopify/Product/6730850828344",
    title: "The Hydrogen",
    publishedAt: "2021-06-17T18:33:17Z",
    handle: "snowboard",
    description:
      "Description Our flagship board, ideal for technical terrain and those who dare to go where the chairlift can't take you. The Hydrogen excels in the backcountry making riding out of bounds as easy as resort groomers. New for 2021, the Hydrogen Snowboard has Oxygen Pack inserts giving you more float on the deepest days. Care Guide Clean well after use Wax regularly Specs Weight: 5 lb Length: 4 ft Width: 1 ft Manufactured on: 8/2/2021, 3:30:00 PM Manufactured by: Shopify",
    priceRange: {
      minVariantPrice: {
        amount: "775.0",
        currencyCode: "CAD",
      },
      maxVariantPrice: {
        amount: "775.0",
        currencyCode: "CAD",
      },
    },
    options: [
      {
        name: "Color",
        values: ["Morning", "Evening", "Night"],
      },
      {
        name: "Size",
        values: ["154", "158", "160"],
      },
    ],
    variants: {
      nodes: [
        {
          id: "gid://shopify/ProductVariant/41007289630776",
          image: {
            url: "https://cdn.shopify.com/s/files/1/0551/4566/0472/products/hydrogen-morning.jpg?v=1636146509",
            altText: "The Hydrogen snowboard, color Morning",
            width: 1200,
            height: 1504,
          },
          price: {
            amount: "775.0",
            currencyCode: "CAD",
          },
          compareAtPrice: {
            amount: "840.0",
            currencyCode: "CAD",
          },
        },
      ],
    },
  },
};

/**
 * getHeroPlaceholder() returns placeholder content when the expected metafields
 * don't exist. Define the following five custom metafields on your Shopify store to override placeholders:
 * - hero.title             Single line text
 * - hero.byline            Single line text
 * - hero.cta               Single line text
 * - hero.spread            File
 * - hero.spread_secondary   File
 *
 * @see https://help.shopify.com/manual/metafields/metafield-definitions/creating-custom-metafield-definitions
 * @see https://github.com/Shopify/hydrogen/discussions/1790
 */

// get product info placeholder data
export function getProductInfoPlaceholder() {
  function getMultipleRandom(arr: any[], infos: number) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, infos);
  }
  return getMultipleRandom(PLACEHOLDERS.PRODUCT_INFO, 3);
}

export function getProductPlaceholder(): Product {
  return PLACEHOLDERS.PRODUCT as unknown as Product;
}
