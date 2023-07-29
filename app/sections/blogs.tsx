import {useLoaderData, useMatches} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

import type {ArticleFragment, BlogQuery} from 'storefrontapi.generated';
import {Grid, Link, PageHeader, Section} from '~/components';
import {getImageLoadingPriority} from '~/lib/const';

interface BlogsProps extends HydrogenComponentProps {
  layout: 'blog' | 'default';
  paddingTop: number;
  paddingBottom: number;
  showDate: boolean;
  showAuthor: boolean;
  imageAspectRatio: string;
}

let Blogs = forwardRef<HTMLElement, BlogsProps>((props, ref) => {
  let {
    layout,
    paddingTop,
    paddingBottom,
    showAuthor,
    showDate,
    imageAspectRatio,
    ...rest
  } = props;
  let {blog, articles} = useLoaderData<
    BlogQuery & {articles: ArticleFragment[]}
  >();

  if (blog) {
    return (
      <section ref={ref} {...rest}>
        <div
          style={{
            paddingTop: `${paddingTop}px`,
            paddingBottom: `${paddingBottom}px`,
          }}
        >
          <PageHeader heading={blog.title} />
          <Section as="div">
            <Grid as="ol" layout={layout}>
              {articles.map((article, i) => (
                <ArticleCard
                  key={article.id}
                  blogHandle={blog.handle}
                  article={article}
                  loading={getImageLoadingPriority(i, 2)}
                  showAuthor={showAuthor}
                  showDate={showDate}
                  imageAspectRatio={imageAspectRatio}
                />
              ))}
            </Grid>
          </Section>
        </div>
      </section>
    );
  }
  return <section ref={ref} {...rest} />;
});

function ArticleCard({
  blogHandle,
  article,
  loading,
  showAuthor,
  showDate,
  imageAspectRatio,
}: {
  blogHandle: string;
  article: ArticleFragment;
  loading?: HTMLImageElement['loading'];
  showDate: boolean;
  showAuthor: boolean;
  imageAspectRatio: string;
}) {
  return (
    <li key={article.id}>
      <Link to={`/blogs/${blogHandle}/${article.handle}`}>
        {article.image && (
          <div className="card-image aspect-[3/2]">
            <Image
              alt={article.image.altText || article.title}
              className="object-cover w-full"
              data={article.image}
              aspectRatio={imageAspectRatio}
              loading={loading}
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        )}
        <h2 className="mt-4 font-medium">{article.title}</h2>
        <div className="flex items-center space-x-1 mt-1">
          {showDate && <span className="block">{article.publishedAt}</span>}
          {showDate && showAuthor && <span>•</span>}
          {showAuthor && <span className="block">{article.author?.name}</span>}
        </div>
      </Link>
    </li>
  );
}

export default Blogs;

export let schema: HydrogenComponentSchema = {
  type: 'blogs',
  title: 'Blogs',
  limit: 1,
  enabledOn: {
    pages: ['BLOG'],
  },
  toolbar: ['general-settings'],
  inspector: [
    {
      group: 'Blogs',
      inputs: [
        {
          type: 'select',
          name: 'layout',
          label: 'Layout',
          configs: {
            options: [
              {value: 'blog', label: 'Blog'},
              {value: 'default', label: 'Default'},
            ],
          },
          defaultValue: 'blog',
        },
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
    {
      group: 'Article card',
      inputs: [
        {
          type: 'select',
          label: 'Image aspect ratio',
          name: 'imageAspectRatio',
          configs: {
            options: [
              {value: 'auto', label: 'Adapt to image'},
              {value: '1/1', label: '1/1'},
              {value: '3/2', label: '3/2'},
              {value: '3/4', label: '3/4'},
              {value: '4/3', label: '4/3'},
            ],
          },
          defaultValue: '3/2',
        },
        {
          type: 'switch',
          name: 'showDate',
          label: 'Show date',
          defaultValue: true,
        },
        {
          type: 'switch',
          name: 'showAuthor',
          label: 'Show author',
          defaultValue: true,
        },
      ],
    },
  ],
};
