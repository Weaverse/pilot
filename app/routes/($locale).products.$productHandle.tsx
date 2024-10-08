import { useLoaderData, useSearchParams } from "@remix-run/react";
import { Analytics, getSeoMeta } from "@shopify/hydrogen";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaArgs,
} from "@shopify/remix-oxygen";
import { defer, json } from "@shopify/remix-oxygen";
import { getSelectedProductOptions } from "@weaverse/hydrogen";
import { useEffect } from "react";
import invariant from "tiny-invariant";
import type {
  ProductQuery,
  ProductRecommendationsQuery,
} from "storefrontapi.generated";
import { routeHeaders } from "~/data/cache";
import {
  PRODUCT_QUERY,
  RECOMMENDED_PRODUCTS_QUERY,
  VARIANTS_QUERY,
} from "~/data/queries";
import { createJudgemeReview, getJudgemeReviews } from "~/lib/judgeme";
import { seoPayload } from "~/lib/seo.server";
import type { Storefront } from "~/lib/type";
import { WeaverseContent } from "~/weaverse";

export let headers = routeHeaders;

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  let { productHandle } = params;
  invariant(productHandle, "Missing productHandle param, check route filename");

  let selectedOptions = getSelectedProductOptions(request);
  let { shop, product } = await context.storefront.query<ProductQuery>(
    PRODUCT_QUERY,
    {
      variables: {
        handle: productHandle,
        selectedOptions,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    }
  );

  if (!product?.id) {
    throw new Response("product", { status: 404 });
  }

  if (!product.selectedVariant && product.options.length) {
    // set the selectedVariant to the first variant if there is only one option
    if (product.options.length < 2) {
      product.selectedVariant = product.variants.nodes[0];
    }
  }

  // In order to show which variants are available in the UI, we need to query
  // all of them. But there might be a *lot*, so instead separate the variants
  // into it's own separate query that is deferred. So there's a brief moment
  // where variant options might show as available when they're not, but after
  // this deferred query resolves, the UI will update.
  let variants = await context.storefront.query(VARIANTS_QUERY, {
    variables: {
      handle: productHandle,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  let recommended = getRecommendedProducts(context.storefront, product.id);

  // TODO: firstVariant is never used because we will always have a selectedVariant due to redirect
  // Investigate if we can avoid the redirect for product pages with no search params for first variant
  let firstVariant = product.variants.nodes[0];
  let selectedVariant = product.selectedVariant ?? firstVariant;

  let seo = seoPayload.product({
    product,
    selectedVariant,
    url: request.url,
  });

  let judgeme_API_TOKEN = context.env.JUDGEME_PRIVATE_API_TOKEN;
  let shop_domain = context.env.PUBLIC_STORE_DOMAIN;
  let judgemeReviews = await getJudgemeReviews(
    judgeme_API_TOKEN,
    shop_domain,
    productHandle,
    context.weaverse
  );

  return defer({
    variants,
    product,
    shop,
    storeDomain: shop.primaryDomain.url,
    recommended,
    seo,
    weaverseData: await context.weaverse.loadPage({
      type: "PRODUCT",
      handle: productHandle,
    }),
    judgemeReviews,
  });
}

export type ProductLoaderType = typeof loader;

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  let judgeme_API_TOKEN = context.env.JUDGEME_PRIVATE_API_TOKEN;
  invariant(judgeme_API_TOKEN, "Missing JUDGEME_PRIVATE_API_TOKEN");
  let response: any = {
    status: 201,
  };
  let shop_domain = context.env.PUBLIC_STORE_DOMAIN;
  response = await createJudgemeReview(
    judgeme_API_TOKEN,
    shop_domain,
    formData
  );
  const { status, ...rest } = response;
  return json(rest, { status });
}

export let meta = ({ matches }: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

/**
 * We need to handle the route change from client to keep the view transition persistent
 */
let useApplyFirstVariant = () => {
  let { product } = useLoaderData<typeof loader>();
  let [searchParams, setSearchParams] = useSearchParams();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!product.selectedVariant) {
      let selectedOptions = product.variants?.nodes?.[0]?.selectedOptions;
      for (let variant of selectedOptions) {
        searchParams.set(variant.name, variant.value);
      }
      setSearchParams(searchParams, {
        replace: true, // prevent adding a new entry to the history stack
      });
    }
  }, [product?.id]);
};

export default function Product() {
  useApplyFirstVariant();
  let { product } = useLoaderData<typeof loader>();
  return (
    <>
      <WeaverseContent />
      {product.selectedVariant && (
        <Analytics.ProductView
          data={{
            products: [
              {
                id: product.id,
                title: product.title,
                price: product.selectedVariant?.price.amount || "0",
                vendor: product.vendor,
                variantId: product.selectedVariant?.id || "",
                variantTitle: product.selectedVariant?.title || "",
                quantity: 1,
              },
            ],
          }}
        />
      )}
    </>
  );
}

async function getRecommendedProducts(
  storefront: Storefront,
  productId: string
) {
  let products = await storefront.query<ProductRecommendationsQuery>(
    RECOMMENDED_PRODUCTS_QUERY,
    {
      variables: { productId, count: 12 },
    }
  );

  invariant(products, "No data returned from Shopify API");

  let mergedProducts = (products.recommended ?? [])
    .concat(products.additional.nodes)
    .filter((prod, idx, arr) => {
      return arr.findIndex(({ id }) => id === prod.id) === idx;
    });

  let originalProduct = mergedProducts.findIndex(
    (item) => item.id === productId
  );

  mergedProducts.splice(originalProduct, 1);

  return { nodes: mergedProducts };
}
