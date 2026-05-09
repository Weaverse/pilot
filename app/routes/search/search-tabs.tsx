import { cn } from "~/utils/cn";
import type { SearchCounts, SearchType } from "./types";

interface SearchTabsProps {
  counts: SearchCounts;
  activeTab: SearchType;
  onTabChange: (type: SearchType) => void;
}

const tabs: { type: SearchType; label: string }[] = [
  { type: "products", label: "Products" },
  { type: "articles", label: "Articles" },
  { type: "pages", label: "Pages" },
  { type: "collections", label: "Collections" },
];

export function SearchTabs({
  counts,
  activeTab,
  onTabChange,
}: SearchTabsProps) {
  return (
    <div className="border-b border-line-subtle">
      <div className="flex gap-8">
        {tabs.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => onTabChange(type)}
            className={cn(
              "relative py-3 font-medium transition-colors cursor-pointer",
              activeTab === type
                ? "text-foreground"
                : "text-body-subtle hover:text-foreground",
            )}
          >
            <span>{label}</span>
            <span
              className={cn(
                "ml-1.5",
                activeTab === type ? "text-foreground" : "text-body-subtle",
              )}
            >
              ({counts[type]})
            </span>
            {activeTab === type && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
