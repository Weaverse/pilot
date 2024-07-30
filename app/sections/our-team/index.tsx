import type {
  ComponentLoaderArgs,
  HydrogenComponentSchema,
  WeaverseMetaObject,
} from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { OurTeamQuery } from "storefrontapi.generated";
import { Section, type SectionProps } from "~/components/Section";

type OurTeamData = {
  metaobject: WeaverseMetaObject;
  itemsCount: number;
};

interface OurTeamProps
  extends SectionProps<Awaited<ReturnType<typeof loader>>>,
    OurTeamData {}

let OurTeam = forwardRef<HTMLDivElement, OurTeamProps>((props, ref) => {
  let { loaderData, metaobject, itemsCount, children, ...rest } = props;
  if (!loaderData) {
    return (
      <Section ref={ref} {...rest}>
        skeleton goes here
      </Section>
    );
  }
  // let items = loaderData?.metaobjects.map((metaObject, ind: number) => {
  //   let { fields } = metaObject;
  //   let avatar = fields.find((field) => field.key === "avatar");
  //   let name = fields.find((field) => field.key === "name")?.value;
  //   let title = fields.find((field) => field.key === "title")?.value;
  //   return (
  //     <div key={ind} className="flex flex-col gap-2 items-center">
  //       <div className="rounded-md overflow-hidden w-44">
  //         <Image
  //           // @ts-ignore
  //           data={avatar?.reference?.image}
  //           sizes="auto"
  //           className="h-auto"
  //           aspectRatio="1/1"
  //         />
  //       </div>
  //       <h3 className="font-semibold text-xl">{name}</h3>
  //       <p>{title}</p>
  //     </div>
  //   );
  // });
  return (
    <Section ref={ref} {...rest}>
      {children}
    </Section>
  );
});

export let loader = async (args: ComponentLoaderArgs<OurTeamData>) => {
  let { weaverse, data } = args;
  let { storefront } = weaverse;
  let { metaobject, itemsCount } = data;
  if (metaobject) {
    return await storefront.query<OurTeamQuery>(OUR_TEAM_QUERY, {
      variables: {
        type: metaobject.handle,
        first: itemsCount,
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
      group: "Our team",
      inputs: [
        {
          label: "Select metaobject definition",
          type: "metaobject",
          helpText:
            '<a href="https://weaverse.io/docs/marketplace/the-pilot-theme#metaobjects" target="_blank">How to display this demo section</a>',
          name: "metaDemo",
          shouldRevalidate: true,
        },
        {
          label: "Member limit",
          name: "itemsPerRow",
          type: "range",
          configs: {
            min: 1,
            max: 10,
          },
          defaultValue: 3,
        },
      ],
    },
  ],
  presets: [
    { type: "heading", content: "Our team" },
    {
      type: "paragraph",
      content:
        "This section get data from storefront metaobjects using Shopify Storefront API powered by Weaverse Metaobject Picker.",
    },
    {
      type: "our-team-members",
    },
  ],
};

export default OurTeam;
