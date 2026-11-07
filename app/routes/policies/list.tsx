import { gql } from "@shopify/hydrogen";
import type { LoaderFunctionArgs, MetaArgs } from "react-router";
import { useLoaderData } from "react-router";
import invariant from "tiny-invariant";
import { seoPayload } from "~/.server/seo";
import { BreadCrumb } from "~/components/breadcrumb";
import { Icon } from "~/components/icon";
import { Link } from "~/components/link";
import { Section } from "~/components/section";
import { CACHE_DEFAULT, routeHeaders } from "~/utils/cache";
import { seoMetaFromMatches } from "~/utils/seo";
import { unwrapStorefront } from "~/utils/storefront";

export const headers = routeHeaders;

type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

export async function loader({
  request,
  context: { storefront },
}: LoaderFunctionArgs) {
  const data = unwrapStorefront(
    await storefront.graphql(POLICIES_QUERY, { cache: CACHE_DEFAULT }),
  );

  invariant(data, "No data returned from Shopify API");

  const { name, ...policyFields } = data.shop as NonNullableFields<
    typeof data.shop
  >;
  const policies = Object.values(policyFields).filter(Boolean);

  if (policies.length === 0) {
    throw new Response("Not found", { status: 404 });
  }

  const seo = seoPayload.policies({
    policies,
    shop: { name },
    url: request.url,
  });

  return {
    policies,
    seo,
  };
}

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
  return seoMetaFromMatches(matches);
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
              <Link
                key={policy.id}
                variant="underline"
                className="w-fit gap-2"
                to={`/policies/${policy.handle}`}
              >
                <Icon name="file-text" className="h-5 w-5" />
                <span>{policy.title}</span>
              </Link>
            );
          }
          return null;
        })}
      </div>
    </Section>
  );
}

const POLICIES_QUERY = gql(`
  fragment PolicyIndex on ShopPolicy {
    id
    title
    handle
  }

  query PoliciesIndex {
    shop {
      name
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
`);
