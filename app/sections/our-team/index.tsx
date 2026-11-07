import { gql, type StorefrontApi } from "@shopify/hydrogen";
import {
  type WeaverseComponentLoaderArgs,
  createSchema,
  type WeaverseMetaObject,
} from "@weaverse/hydrogen/react-router";
import { backgroundInputs } from "~/components/background-image";
import { layoutInputs, Section, type SectionProps } from "~/components/section";
import { CACHE_DEFAULT } from "~/utils/cache";
import { unwrapStorefront } from "~/utils/storefront";

type OurTeamData = {
  metaobject: WeaverseMetaObject;
  membersCount: number;
};

interface OurTeamProps
  extends SectionProps<Awaited<ReturnType<typeof loader>>>, OurTeamData {}

function OurTeam(props: OurTeamProps) {
  const { loaderData, metaobject, membersCount, children, ...rest } = props;
  return <Section {...rest}>{children}</Section>;
}

export const loader = async (
  args: WeaverseComponentLoaderArgs<OurTeamData>,
) => {
  const { weaverse, data } = args;
  const { storefront } = weaverse;
  const { metaobject, membersCount } = data;
  if (metaobject) {
    return unwrapStorefront(
      await storefront.graphql(OUR_TEAM_QUERY, {
        variables: {
          type: metaobject.handle,
          first: membersCount,
        },
        cache: CACHE_DEFAULT,
      }),
    );
  }
  return null;
};

const OUR_TEAM_QUERY = gql(`
  query OurTeam(
    $country: CountryCode
    $language: LanguageCode
    $type: String!
    $first: Int
  ) @inContext(country: $country, language: $language) {
    metaobjects(type: $type, first: $first) {
      nodes {
        fields {
          key
          type
          value
          reference {
            ... on MediaImage {
              alt
              image {
                altText
                url
                width
                height
              }
            }
          }
        }
        handle
        id
        type
      }
    }
  }
`);

export type OurTeamQuery = StorefrontApi.ResultOf<typeof OUR_TEAM_QUERY>;

export const schema = createSchema({
  type: "our-team",
  title: "Our team",
  childTypes: ["heading", "paragraph", "our-team-members"],
  settings: [
    {
      group: "Data source",
      inputs: [
        {
          type: "metaobject",
          name: "metaobject",
          label: "Select metaobject definition",
          helpText:
            'See how to set up a metaobject definition for this section <a href="https://docs.weaverse.io/themes-templates/pilot-theme-overview#metaobjects" target="_blank">here</a>.',
        },
        {
          label: "Members count",
          name: "membersCount",
          type: "range",
          configs: {
            min: 2,
            max: 12,
            step: 1,
          },
          defaultValue: 4,
        },
      ],
    },
    {
      group: "Layout",
      inputs: layoutInputs,
    },
    {
      group: "Background",
      inputs: backgroundInputs.filter((inp) => inp.name === "backgroundColor"),
    },
  ],
  presets: {
    children: [
      { type: "heading", content: "Meet our team" },
      {
        type: "paragraph",
        content:
          "This section get data from storefront metaobjects using Shopify Storefront API powered by Weaverse Metaobject Picker.",
      },
      {
        type: "our-team-members",
      },
    ],
  },
});

export default OurTeam;
