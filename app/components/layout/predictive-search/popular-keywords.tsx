import { useThemeSettings } from "@weaverse/hydrogen";

export function PopularKeywords({
  onKeywordClick,
}: {
  onKeywordClick: (keyword: string) => void;
}) {
  const { popularSearchKeywords } = useThemeSettings();
  if (!popularSearchKeywords?.length) {
    return null;
  }

  const popularKeywords: string[] = popularSearchKeywords
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  return (
    <div className="flex items-center gap-2">
      <span>Popular searches:</span>
      <div className="flex flex-wrap gap-2">
        {popularKeywords.map((keyword, index) => (
          <button
            key={keyword}
            type="button"
            onClick={() => onKeywordClick(keyword)}
            className="py-1 text-gray-700 underline-offset-4 transition-colors hover:underline focus-visible:outline-hidden"
          >
            {keyword}
            {index < popularKeywords.length - 1 && ","}
          </button>
        ))}
      </div>
    </div>
  );
}
