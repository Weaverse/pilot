import {useLoaderData} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import type {Article} from '@shopify/hydrogen/storefront-api-types';
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

import {IconFacebook, IconPinterest, Section} from '~/components';

interface BlogPostProps extends HydrogenComponentProps {
  paddingTop: number;
  paddingBottom: number;
}

let BlogPost = forwardRef<HTMLElement, BlogPostProps>((props, ref) => {
  let {paddingTop, paddingBottom, ...rest} = props;
  let {article, formattedDate} = useLoaderData<{
    article: Article;
    formattedDate: string;
  }>();
  let {title, image, contentHtml, author, tags} = article;
  if (article) {
    return (
      <section ref={ref} {...rest}>
        <div
          style={{
            paddingTop: `${paddingTop}px`,
            paddingBottom: `${paddingBottom}px`,
          }}
        >
          <div className="relative h-[520px]">
            {image && (
              <Image
                data={image}
                className="w-full absolute inset-0 z-0 object-cover h-full"
                sizes="90vw"
              />
            )}
            <div className="space-y-5 w-full h-full flex items-center justify-end py-16 flex-col relative z-10">
              <span className="font-semibold">{formattedDate}</span>
              <h1 className="font-bold text-2xl">{title}</h1>
              <span className="uppercase">by {author?.name}</span>
            </div>
          </div>
          <Section as="article" padding="all">
            <div className="lg:max-w-screen-lg md:max-w-screen-md max-w-screen-sm px-4 mx-auto space-y-8 md:space-y-16">
              <div dangerouslySetInnerHTML={{__html: contentHtml}} />
              <div className="md:flex justify-between gap-2 space-y-2">
                <div>
                  <strong>Tags:</strong>
                  <span className="ml-2">{tags.join(', ')}</span>
                </div>
                <div className="flex gap-4 items-center">
                  <strong>Share:</strong>
                  <IconPinterest viewBox="0 0 24 24" />
                  <IconFacebook viewBox="0 0 24 24" />
                </div>
              </div>
            </div>
          </Section>
        </div>
      </section>
    );
  }
  return <section ref={ref} {...rest} />;
});

export default BlogPost;

export let schema: HydrogenComponentSchema = {
  type: 'blog-post',
  title: 'Blog post',
  limit: 1,
  enabledOn: {
    pages: ['ARTICLE'],
  },
  toolbar: ['general-settings'],
  inspector: [
    {
      group: 'Blog post',
      inputs: [
        {
          type: 'range',
          label: 'Top padding',
          name: 'paddingTop',
          configs: {
            min: 0,
            max: 100,
            step: 4,
            unit: 'px',
          },
          defaultValue: 0,
        },
        {
          type: 'range',
          label: 'Bottom padding',
          name: 'paddingBottom',
          configs: {
            min: 0,
            max: 100,
            step: 4,
            unit: 'px',
          },
          defaultValue: 0,
        },
      ],
    },
  ],
};
