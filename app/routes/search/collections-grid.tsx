import { clsx } from "clsx";
import type { CSSProperties } from "react";
import { Image } from "~/components/image";
import { Link } from "~/components/link";
import { Overlay } from "~/components/overlay";
import { calculateAspectRatio } from "~/utils/image";
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
          className="flex flex-col gap-2"
          style={
            {
              "--aspect-ratio": calculateAspectRatio(collection.image, "4/3"),
            } as CSSProperties
          }
        >
          <div className="group relative flex aspect-(--aspect-ratio) items-center justify-center overflow-hidden">
            {collection.image?.url ? (
              <Image
                data={collection.image}
                width={collection.image.width || 600}
                height={collection.image.height || 400}
                sizes="(max-width: 32em) 100vw, 45vw"
                className={clsx(
                  "absolute inset-0 z-0",
                  "transition-all duration-300",
                  "scale-100 will-change-transform group-hover:scale-[1.03]",
                )}
              />
            ) : null}
            <h5 className="z-1 text-white">{collection.title}</h5>
            <Overlay
              enableOverlay
              overlayColor="#000000"
              overlayColorHover="#000000"
              overlayOpacity={40}
              className="z-0"
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
