import { ArrowRightIcon } from "@phosphor-icons/react";
import { Link } from "~/components/link";
import type { PageSearchResult } from "./types";

interface PagesListProps {
  pages: PageSearchResult[];
}

export function PagesList({ pages }: PagesListProps) {
  return (
    <div className="space-y-3">
      {pages.map((page) => (
        <Link
          key={page.id}
          to={`/pages/${page.handle}`}
          className="flex items-center gap-4 rounded-lg border border-line-subtle p-4 transition-colors hover:bg-secondary"
        >
          <div className="flex-1">
            <h3 className="font-medium">{page.title}</h3>
          </div>
          <ArrowRightIcon className="size-5 text-body-subtle" />
        </Link>
      ))}
    </div>
  );
}
