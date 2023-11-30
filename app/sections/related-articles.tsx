import {Await, Link, useLoaderData} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {Suspense, forwardRef} from 'react';
import type {ArticleFragment} from 'storefrontapi.generated';
import {Skeleton} from '~/components';
import {getImageLoadingPriority} from '~/lib/const';

interface RelatedArticlesProps extends HydrogenComponentProps {
  heading: string;
  articlesCount: number;
  showExcerpt: boolean;
  showReadmore: boolean;
  showDate: boolean;
  showAuthor: boolean;
  imageAspectRatio: string;
}

let RelatedArticles = forwardRef<HTMLElement, RelatedArticlesProps>(
  (props, ref) => {
    let {blog, relatedArticles} = useLoaderData<{
      relatedArticles: any[];
      blog: {handle: string};
    }>();
    let {
      heading,
      articlesCount,
      showExcerpt,
      showAuthor,
      showDate,
      showReadmore,
      imageAspectRatio,
      ...rest
    } = props;
    if (relatedArticles.length > 0) {
      return (
        <section ref={ref} {...rest}>
          <Suspense fallback={<Skeleton className="h-32" />}>
            <Await
              errorElement="There was a problem loading related products"
              resolve={relatedArticles}
            >
              <div className="space-y-8 md:space-y-16 md:p-8 lg:p-12 p-4">
                <h2 className="text-3xl font-bold max-w-prose text-center mx-auto">
                  {heading}
                </h2>
                <ol className="md:grid grid-cols-3 hiddenScroll md:gap-6">
                  {relatedArticles.slice(0, articlesCount).map((article, i) => (
                    <ArticleCard
                      key={article.id}
                      blogHandle={blog!.handle}
                      article={article}
                      loading={getImageLoadingPriority(i, 2)}
                      showAuthor={showAuthor}
                      showExcerpt={showExcerpt}
                      showDate={showDate}
                      showReadmore={showReadmore}
                      imageAspectRatio={imageAspectRatio}
                    />
                  ))}
                </ol>
              </div>
            </Await>
          </Suspense>
        </section>
      );
    }
    return <section ref={ref} />;
  },
);

function ArticleCard({
  blogHandle,
  article,
  loading,
  showExcerpt,
  showAuthor,
  showDate,
  showReadmore,
  imageAspectRatio,
}: {
  blogHandle: string;
  article: ArticleFragment;
  loading?: HTMLImageElement['loading'];
  showDate: boolean;
  showExcerpt: boolean;
  showAuthor: boolean;
  showReadmore: boolean;
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
        <div className="space-y-2.5">
          <h2 className="mt-4 font-medium text-2xl">{article.title}</h2>
          <div className="flex items-center space-x-1">
            {showDate && <span className="block">{article.publishedAt}</span>}
            {showDate && showAuthor && <span>•</span>}
            {showAuthor && (
              <span className="block">{article.author?.name}</span>
            )}
          </div>
          {showExcerpt && <div className="text-sm"> {article.excerpt}</div>}
          {showReadmore && (
            <div>
              <span className="underline">Read more</span>
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}

export default RelatedArticles;

export let schema: HydrogenComponentSchema = {
  type: 'related-articles',
  title: 'Related articles',
  limit: 1,
  enabledOn: {
    pages: ['ARTICLE'],
  },
  inspector: [
    {
      group: 'Related articles',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Related articles',
          placeholder: 'Related articles',
        },
        {
          type: 'range',
          name: 'articlesCount',
          label: 'Number of articles',
          defaultValue: 3,
          configs: {
            min: 1,
            max: 12,
            step: 1,
          },
        },
        {
          type: 'switch',
          name: 'showExcerpt',
          label: 'Show excerpt',
          defaultValue: false,
        },
        {
          type: 'switch',
          name: 'showDate',
          label: 'Show date',
          defaultValue: false,
        },
        {
          type: 'switch',
          name: 'showAuthor',
          label: 'Show author',
          defaultValue: false,
        },
        {
          type: 'switch',
          name: 'showReadmore',
          label: 'Show read more',
          defaultValue: true,
        },
      ],
    },
  ],
  toolbar: ['general-settings', ['duplicate', 'delete']],
};
