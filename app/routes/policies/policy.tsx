import type { LoaderFunctionArgs } from "@shopify/remix-oxygen";
import { useLoaderData } from "react-router";
import type { PoliciesHandleQuery } from "storefront-api.generated";
import invariant from "tiny-invariant";
import { BreadCrumb } from "~/components/breadcrumb";
import Link from "~/components/link";
import { Section } from "~/components/section";
import { routeHeaders } from "~/utils/cache";
import { seoPayload } from "~/utils/seo.server";

export const headers = routeHeaders;

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  invariant(params.policyHandle, "Missing policy handle");

  const policyName = params.policyHandle.replace(
    /-([a-z])/g,
    (_: unknown, m1: string) => m1.toUpperCase(),
  ) as "privacyPolicy" | "shippingPolicy" | "termsOfService" | "refundPolicy";

  const data = await context.storefront.query<PoliciesHandleQuery>(
    POLICY_CONTENT_QUERY,
    {
      variables: {
        privacyPolicy: false,
        shippingPolicy: false,
        termsOfService: false,
        refundPolicy: false,
        [policyName]: true,
        language: context.storefront.i18n.language,
      },
    },
  );

  invariant(data, "No data returned from Shopify API");
  const policy = data.shop?.[policyName];

  if (!policy) {
    throw new Response(null, { status: 404 });
  }

  const seo = seoPayload.policy({ policy, url: request.url });

  return { policy, seo };
}

export default function Policies() {
  const { policy } = useLoaderData<typeof loader>();

  return (
    <Section verticalPadding="medium" width="fixed">
      <BreadCrumb page="Policies" className="mb-4" />
      <h4 className="mb-4 font-medium">Policies</h4>
      <Link variant="underline" to="/policies">
        &larr; Back to Policies
      </Link>
      <div className="mt-8 lg:mt-20">
        <div
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: policy.body }}
          className="prose"
        />
      </div>
    </Section>
  );
}

const POLICY_CONTENT_QUERY = `#graphql
  fragment PolicyHandle on ShopPolicy {
    body
    handle
    id
    title
    url
  }

  query PoliciesHandle(
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
    $refundPolicy: Boolean!
  ) @inContext(language: $language) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...PolicyHandle
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...PolicyHandle
      }
      termsOfService @include(if: $termsOfService) {
        ...PolicyHandle
      }
      refundPolicy @include(if: $refundPolicy) {
        ...PolicyHandle
      }
    }
  }
`;
