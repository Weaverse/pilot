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
    <div className="border-line-subtle border-b">
      <div className="flex gap-8">
        {tabs.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => onTabChange(type)}
            className={cn(
              "relative cursor-pointer py-3 font-medium transition-colors",
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
              <span className="bg-foreground absolute right-0 bottom-0 left-0 h-0.5" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
