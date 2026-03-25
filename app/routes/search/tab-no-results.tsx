import { MagnifyingGlassIcon } from "@phosphor-icons/react";
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
      <div className="mb-4 rounded-full bg-secondary p-4">
        <MagnifyingGlassIcon className="size-8 text-body-subtle" />
      </div>
      <h3 className="text-lg font-medium">No {TYPE_LABELS[type]} found</h3>
      <p className="mt-1 text-body-subtle">
        We couldn't find any {TYPE_LABELS[type]} matching "{searchTerm}"
      </p>
      <p className="mt-2 text-sm text-body-subtle">
        Try checking your spelling or using different keywords
      </p>
    </div>
  );
}
