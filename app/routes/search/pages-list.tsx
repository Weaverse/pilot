import { IMAGES_PLACEHOLDERS } from "@weaverse/hydrogen";
import { Image } from "~/components/image";
import { Link } from "~/components/link";
import { RevealUnderline } from "~/components/reveal-underline";
import { calculateAspectRatio } from "~/utils/image";
import type { PageSearchResult } from "./types";

const PLACEHOLDER_IMAGE = {
  url: IMAGES_PLACEHOLDERS.image,
  altText: "Page thumbnail",
  width: 800,
  height: 600,
};

function getPageExcerpt(body?: string, maxLength: number = 120): string {
  if (!body) {
    return "";
  }

  // Strip HTML tags
  const text = body.replace(/<[^>]*>/g, " ");

  // Normalize whitespace
  const normalizedText = text.replace(/\s+/g, " ").trim();

  // Truncate if needed
  if (normalizedText.length <= maxLength) {
    return normalizedText;
  }

  // Find the last space before maxLength to avoid cutting words
  const truncated = normalizedText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > 0) {
    return `${truncated.substring(0, lastSpace)}...`;
  }

  return `${truncated}...`;
}

interface PagesListProps {
  pages: PageSearchResult[];
}

export function PagesList({ pages }: PagesListProps) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
      {pages.map((page) => (
        <div key={page.id} className="flex flex-col gap-5">
          <Link to={`/pages/${page.handle}`} className="flex flex-col gap-5">
            <Image
              alt={page.title}
              data={PLACEHOLDER_IMAGE}
              aspectRatio={calculateAspectRatio(PLACEHOLDER_IMAGE, "16/9")}
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </Link>
          <div className="space-y-2.5">
            <Link to={`/pages/${page.handle}`} className="inline-block">
              <RevealUnderline className="text-xl leading-6">
                {page.title}
              </RevealUnderline>
            </Link>
            {page.body && (
              <p className="line-clamp-2 text-sm text-gray-600">
                {getPageExcerpt(page.body)}
              </p>
            )}
            <div>
              <Link to={`/pages/${page.handle}`} variant="underline">
                View page →
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
