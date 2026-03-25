import { Link, useSearchParams } from "react-router";
import { cn } from "~/utils/cn";
import type { SearchCounts, SearchType } from "./types";

interface SearchTabsProps {
  counts: SearchCounts;
}

const tabs: { type: SearchType; label: string }[] = [
  { type: "products", label: "Products" },
  { type: "articles", label: "Articles" },
  { type: "pages", label: "Pages" },
  { type: "collections", label: "Collections" },
];

export function SearchTabs({ counts }: SearchTabsProps) {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("q") || "";
  const activeTab = (searchParams.get("type") as SearchType) || "products";

  return (
    <div className="border-b border-line-subtle">
      <div className="flex gap-8">
        {tabs.map(({ type, label }) => (
          <Link
            key={type}
            to={`/search?q=${encodeURIComponent(searchTerm)}&type=${type}`}
            className={cn(
              "relative py-3 text-sm font-medium transition-colors",
              activeTab === type
                ? "text-foreground"
                : "text-body-subtle hover:text-foreground",
            )}
          >
            <span>{label}</span>
            <span
              className={cn(
                "ml-1.5 text-xs",
                activeTab === type ? "text-foreground" : "text-body-subtle",
              )}
            >
              ({counts[type]})
            </span>
            {activeTab === type && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
