import { Icon } from "~/components/icon";
import type { SearchType } from "./types";

interface TabNoResultsProps {
  type: SearchType;
  searchTerm: string;
}

const TYPE_LABELS: Record<SearchType, string> = {
  products: "products",
  articles: "articles",
  pages: "pages",
  collections: "collections",
};

export function TabNoResults({ type, searchTerm }: TabNoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-secondary mb-4 rounded-full p-4">
        <Icon name="magnifying-glass" className="text-body-subtle size-8" />
      </div>
      <h3 className="text-lg font-medium">No {TYPE_LABELS[type]} found</h3>
      <p className="text-body-subtle mt-1">
        We couldn't find any {TYPE_LABELS[type]} matching "{searchTerm}"
      </p>
      <p className="text-body-subtle mt-2 text-sm">
        Try checking your spelling or using different keywords
      </p>
    </div>
  );
}
