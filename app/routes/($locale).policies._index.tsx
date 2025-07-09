import { FileTextIcon } from "@phosphor-icons/react";
import type { SeoConfig } from "@shopify/hydrogen";
import { getSeoMeta } from "@shopify/hydrogen";
import type { LoaderFunctionArgs } from "@shopify/remix-oxygen";
import type { MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import type { PoliciesIndexQuery } from "storefront-api.generated";
import invariant from "tiny-invariant";
import { BreadCrumb } from "~/components/breadcrumb";
import { Link } from "~/components/link";
import { Section } from "~/components/section";
import { routeHeaders } from "~/utils/cache";
import { seoPayload } from "~/utils/seo.server";

export const headers = routeHeaders;

type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

export async function loader({
  request,
  context: { storefront },
}: LoaderFunctionArgs) {
  const data = await storefront.query<PoliciesIndexQuery>(POLICIES_QUERY);

  invariant(data, "No data returned from Shopify API");

  const policies = Object.values(
    data.shop as NonNullableFields<typeof data.shop>,
  ).filter(Boolean);

  if (policies.length === 0) {
    throw new Response("Not found", { status: 404 });
  }

  const seo = seoPayload.policies({ policies, url: request.url });

  return {
    policies,
    seo,
  };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return getSeoMeta(data.seo as SeoConfig);
};

export default function Policies() {
  const { policies } = useLoaderData<typeof loader>();

  return (
    <Section width="fixed" verticalPadding="medium">
      <BreadCrumb page="Policies" className="mb-4" />
      <h4 className="mb-8 font-medium lg:mb-20">Policies</h4>
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
                  <FileTextIcon className="h-5 w-5" />
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
