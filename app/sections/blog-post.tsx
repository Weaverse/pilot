import {useLoaderData} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import {Article} from '@shopify/hydrogen/storefront-api-types';
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

import {PageHeader, Section} from '~/components';

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
  let {title, image, contentHtml, author} = article;

  if (article) {
    return (
      <section ref={ref} {...rest}>
        <div
          style={{
            paddingTop: `${paddingTop}px`,
            paddingBottom: `${paddingBottom}px`,
          }}
        >
          <PageHeader heading={title} variant="blogPost">
            <span>
              {formattedDate} &middot; {author?.name}
            </span>
          </PageHeader>
          <Section as="article" padding="x">
            {image && (
              <Image
                data={image}
                className="w-full mx-auto mt-8 md:mt-16 max-w-7xl"
                sizes="90vw"
                loading="eager"
              />
            )}
            <div
              dangerouslySetInnerHTML={{__html: contentHtml}}
              className="article"
            />
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
