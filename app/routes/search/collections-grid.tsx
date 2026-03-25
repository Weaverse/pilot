import { Image } from "~/components/image";
import { Link } from "~/components/link";
import type { CollectionSearchResult } from "./types";

interface CollectionsGridProps {
  collections: CollectionSearchResult[];
}

export function CollectionsGrid({ collections }: CollectionsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <Link
          key={collection.id}
          to={`/collections/${collection.handle}`}
          className="group relative aspect-4/3 overflow-hidden rounded-lg"
        >
          {collection.image?.url ? (
            <Image
              src={collection.image.url}
              alt={collection.image.altText || collection.title}
              width={600}
              aspectRatio="4/3"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary">
              <span className="text-body-subtle">No image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-medium text-white">{collection.title}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}
