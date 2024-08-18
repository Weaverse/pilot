import type {
  ComponentLoaderArgs,
  HydrogenComponentSchema,
  WeaverseMetaObject,
} from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { OurTeamQuery } from "storefrontapi.generated";
import { backgroundInputs } from "~/components/background-image";
import { Section, type SectionProps, layoutInputs } from "~/components/section";

type OurTeamData = {
  metaobject: WeaverseMetaObject;
  membersCount: number;
};

interface OurTeamProps
  extends SectionProps<Awaited<ReturnType<typeof loader>>>,
    OurTeamData {}

let OurTeam = forwardRef<HTMLDivElement, OurTeamProps>((props, ref) => {
  let { loaderData, metaobject, membersCount, children, ...rest } = props;
  return (
    <Section ref={ref} {...rest}>
      {children}
    </Section>
  );
});

export let loader = async (args: ComponentLoaderArgs<OurTeamData>) => {
  let { weaverse, data } = args;
  let { storefront } = weaverse;
  let { metaobject, membersCount } = data;
  if (metaobject) {
    return await storefront.query<OurTeamQuery>(OUR_TEAM_QUERY, {
      variables: {
        type: metaobject.handle,
        first: membersCount,
      },
    });
  }
  return null;
};

let OUR_TEAM_QUERY = `#graphql
  query OurTeam ($type: String!, $first: Int) {
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
`;

export let schema: HydrogenComponentSchema = {
  type: "our-team",
  title: "Our team",
  childTypes: ["heading", "paragraph", "our-team-members"],
  inspector: [
    {
      group: "Data source",
      inputs: [
        {
          type: "metaobject",
          name: "metaobject",
          label: "Select metaobject definition",
          helpText:
            'See how to set up a metaobject definition for this section <a href="https://weaverse.io/docs/marketplace/the-pilot-theme#metaobjects" target="_blank">here</a>.',
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
      inputs: layoutInputs.filter((inp) => inp.name !== "borderRadius"),
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
};

export default OurTeam;
