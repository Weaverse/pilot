import { Link } from "@remix-run/react";
import { Image } from "@shopify/hydrogen";
import {
  type HydrogenComponentProps,
  type HydrogenComponentSchema,
  type WeaverseImage,
  useParentInstance,
} from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { OurTeamQuery } from "storefrontapi.generated";
import {
  IconGithubLogo,
  IconLinkedinLogo,
  IconXLogo,
} from "~/components/icons";

type MemberType = {
  name: string;
  title: string;
  bio: string;
  avatar: WeaverseImage;
  github_url: string;
  linkedin_url: string;
  x_url: string;
};

let TeamMembers = forwardRef<HTMLDivElement, HydrogenComponentProps>(
  (props, ref) => {
    let parent = useParentInstance();
    let { metaobjects }: OurTeamQuery = parent.data.loaderData || {};
    if (metaobjects?.nodes?.length) {
      let members = metaobjects.nodes;
      return (
        <div
          ref={ref}
          {...props}
          className="grid gap-8 mb-6 lg:mb-16 md:grid-cols-2 pt-4"
        >
          {members.map(({ id, fields }) => {
            let member: Partial<MemberType> = {};
            for (let { key, value, reference } of fields) {
              // @ts-ignore
              member[key] = key === "avatar" ? reference?.image : value;
            }
            let { name, title, bio, avatar, github_url, linkedin_url, x_url } =
              member;
            return (
              <div key={id} className="items-center bg-gray-50 sm:flex">
                {avatar && (
                  <Image
                    data={avatar}
                    sizes="auto"
                    className="w-full h-auto sm:w-48 sm:h-48"
                    aspectRatio="1/1"
                    width={500}
                    height={500}
                  />
                )}
                <div className="p-5">
                  <div className="text-xl font-semibold tracking-tight">
                    {name}
                  </div>
                  <span className="text-gray-600">{title}</span>
                  {bio && (
                    <p className="mt-3 mb-4 font-light text-gray-600">{bio}</p>
                  )}
                  <ul className="flex space-x-3">
                    {linkedin_url && (
                      <li>
                        <Link
                          to={linkedin_url}
                          target="_blank"
                          className="text-gray-500 hover:text-gray-900"
                        >
                          <IconLinkedinLogo className="w-6 h-6" />
                        </Link>
                      </li>
                    )}
                    {github_url && (
                      <li>
                        <Link
                          to={github_url}
                          target="_blank"
                          className="text-gray-500 hover:text-gray-900"
                        >
                          <IconGithubLogo className="w-6 h-6" />
                        </Link>
                      </li>
                    )}
                    {x_url && (
                      <li>
                        <Link
                          to={x_url}
                          target="_blank"
                          className="text-gray-500 hover:text-gray-900"
                        >
                          <IconXLogo className="w-6 h-6" />
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    return (
      <div ref={ref} {...props}>
        <div className="p-8 text-center">No members data available</div>
      </div>
    );
  },
);

export default TeamMembers;

export let schema: HydrogenComponentSchema = {
  type: "our-team-members",
  title: "Members",
  inspector: [],
};
