import type { SearchPageQuery } from "storefront-api.generated";
import { ArticleCard } from "~/sections/blogs";

type SearchArticle = SearchPageQuery["articles"]["nodes"][number];

interface ArticlesGridProps {
  articles: SearchArticle[];
}

export function ArticlesGrid({ articles }: ArticlesGridProps) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          blogHandle={article.blog.handle}
          article={article}
          showAuthor={false}
          showExcerpt={true}
          showDate={true}
          showReadmore={true}
          imageAspectRatio="16/9"
        />
      ))}
    </div>
  );
}
