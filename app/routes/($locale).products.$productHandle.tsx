import { Analytics, getSeoMeta } from "@shopify/hydrogen";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaArgs,
} from "@shopify/remix-oxygen";
import { data } from "@shopify/remix-oxygen";
import { getSelectedProductOptions } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import type { ProductQuery, VariantsQuery } from "storefront-api.generated";
import invariant from "tiny-invariant";
import { PRODUCT_QUERY, VARIANTS_QUERY } from "~/graphql/queries";
import { routeHeaders } from "~/utils/cache";
import { createJudgeMeReview, getJudgeMeProductReviews } from "~/utils/judgeme";
import { getRecommendedProducts } from "~/utils/product";
import { redirectIfHandleIsLocalized } from "~/utils/redirect";
import { seoPayload } from "~/utils/seo.server";
import { WeaverseContent } from "~/weaverse";

export let headers = routeHeaders;

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  let { productHandle: handle } = params;

  invariant(handle, "Missing productHandle param, check route filename");

  let { storefront, weaverse } = context;
  let selectedOptions = getSelectedProductOptions(request);
  let [{ shop, product }, weaverseData, productReviews] = await Promise.all([
    storefront.query<ProductQuery>(PRODUCT_QUERY, {
      variables: {
        handle,
        selectedOptions,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    }),
    weaverse.loadPage({ type: "PRODUCT", handle }),
    getJudgeMeProductReviews({ context, handle }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response("product", { status: 404 });
  }
  redirectIfHandleIsLocalized(request, { handle, data: product });

  // Load variants since they're needed for initial rendering
  let { product: productWithAllVariants } =
    await storefront.query<VariantsQuery>(VARIANTS_QUERY, {
      variables: {
        handle,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    });

  let variants = productWithAllVariants.variants.nodes;

  // Use Hydrogen/Remix streaming for recommended products
  let recommended = getRecommendedProducts(storefront, product.id);

  return {
    shop,
    product,
    variants,
    weaverseData,
    productReviews,
    storeDomain: shop.primaryDomain.url,
    seo: seoPayload.product({
      product: { ...product, variants },
      url: request.url,
    }),
    recommended,
    selectedOptions,
  };
}

export async function action({
  request,
  context: { env },
}: ActionFunctionArgs) {
  try {
    invariant(
      env.JUDGEME_PRIVATE_API_TOKEN,
      "Missing `JUDGEME_PRIVATE_API_TOKEN`",
    );

    let response = await createJudgeMeReview({
      formData: await request.formData(),
      apiToken: env.JUDGEME_PRIVATE_API_TOKEN,
      shopDomain: env.PUBLIC_STORE_DOMAIN,
    });
    return response;
  } catch (error) {
    console.error(error);
    return data({ error: "Failed to create review!" }, { status: 500 });
  }
}

export let meta = ({ matches }: MetaArgs<typeof loader>) => {
  return getSeoMeta(
    ...matches.map((match) => (match.data as any)?.seo).filter(Boolean),
  );
};

export default function Product() {
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
