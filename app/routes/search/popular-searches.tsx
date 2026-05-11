import { useThemeText } from "@weaverse/hydrogen";
import { Fragment } from "react";
import Link from "~/components/link";

export function PopularKeywords() {
  const { t } = useThemeText();
  const popularSearchKeywords = t("search.popularKeywords");
  if (!popularSearchKeywords?.length) {
    return null;
  }
  const popularKeywords: string[] = popularSearchKeywords
    .split(",")
    .map((k: string) => k.trim())
    .filter((k: string) => k.length > 0);

  return (
    <div className="flex items-center justify-center text-body-subtle">
      <span>{t("search.popularSearches")}</span>
      {popularKeywords.map((search, ind) => (
        <Fragment key={search}>
          <Link
            to={`/search?q=${search}`}
            className="ml-1 underline-offset-4 hover:underline"
          >
            {search}
          </Link>
          {ind < popularKeywords.length - 1 && <span className="mr-px">,</span>}
        </Fragment>
      ))}
    </div>
  );
}
