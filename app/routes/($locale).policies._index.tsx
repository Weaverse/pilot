import type { MetaFunction } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";
import type { SeoConfig } from "@shopify/hydrogen";
import { getSeoMeta } from "@shopify/hydrogen";
import { type LoaderFunctionArgs, json } from "@shopify/remix-oxygen";
import invariant from "tiny-invariant";
import { routeHeaders } from "~/utils/cache";
import { seoPayload } from "~/utils/seo.server";
import { Link } from "~/components/link";
import type { PoliciesIndexQuery } from "storefront-api.generated";
import { BreadCrumb } from "~/components/breadcrumb";
import { Section } from "~/components/section";
import { FileText } from "@phosphor-icons/react";

export let headers = routeHeaders;

type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

export async function loader({
  request,
  context: { storefront },
}: LoaderFunctionArgs) {
  let data = await storefront.query<PoliciesIndexQuery>(POLICIES_QUERY);

  invariant(data, "No data returned from Shopify API");

  let policies = Object.values(
    data.shop as NonNullableFields<typeof data.shop>,
  ).filter(Boolean);

  if (policies.length === 0) {
    throw new Response("Not found", { status: 404 });
  }

  let seo = seoPayload.policies({ policies, url: request.url });

  return json({
    policies,
    seo,
  });
}

export let meta: MetaFunction<typeof loader> = ({ data }) => {
  return getSeoMeta(data.seo as SeoConfig);
};

export default function Policies() {
  let { policies } = useLoaderData<typeof loader>();

  return (
    <Section width="fixed" verticalPadding="medium">
      <BreadCrumb page="Policies" className="mb-4" />
      <h4 className="mb-8 lg:mb-20 font-medium">Policies</h4>
      <div className="flex flex-col gap-3">
        {policies.map((policy) => {
          if (policy) {
            return (
              policy && (
                <Link
                  variant="underline"
                  className="w-fit gap-2"
                  to={`/policies/${policy.handle}`}
                >
                  <FileText className="w-5 h-5" />
                  <span>{policy.title}</span>
                </Link>
              )
            );
          }
          return null;
        })}
      </div>
    </Section>
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
