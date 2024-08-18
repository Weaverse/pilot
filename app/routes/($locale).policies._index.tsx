import type { MetaFunction } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";
import type { SeoConfig } from "@shopify/hydrogen";
import { getSeoMeta } from "@shopify/hydrogen";
import { type LoaderFunctionArgs, json } from "@shopify/remix-oxygen";
import invariant from "tiny-invariant";
import { routeHeaders } from "~/data/cache";
import { seoPayload } from "~/lib/seo.server";
import type { NonNullableFields } from "~/lib/type";
import { Heading, PageHeader, Section } from "~/modules/text";
import { Link } from "~/components/link";

export const headers = routeHeaders;

export async function loader({
  request,
  context: { storefront },
}: LoaderFunctionArgs) {
  const data = await storefront.query(POLICIES_QUERY);

  invariant(data, "No data returned from Shopify API");
  const policies = Object.values(
    data.shop as NonNullableFields<typeof data.shop>,
  ).filter(Boolean);

  if (policies.length === 0) {
    throw new Response("Not found", { status: 404 });
  }

  const seo = seoPayload.policies({ policies, url: request.url });

  return json({
    policies,
    seo,
  });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function Policies() {
  const { policies } = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeader heading="Policies" />
      <Section padding="x" className="mb-24">
        {policies.map((policy) => {
          return (
            policy && (
              <Heading className="font-normal text-2xl" key={policy.id}>
                <Link to={`/policies/${policy.handle}`}>{policy.title}</Link>
              </Heading>
            )
          );
        })}
      </Section>
    </>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyIndex on ShopPolicy {
    id
    title
    handle
  }

  query PoliciesIndex {
    shop {
      privacyPolicy {
        ...PolicyIndex
      }
      shippingPolicy {
        ...PolicyIndex
      }
      termsOfService {
        ...PolicyIndex
      }
      refundPolicy {
        ...PolicyIndex
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
`;
