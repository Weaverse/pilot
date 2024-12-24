import { Image } from "@shopify/hydrogen";
import type { Collection } from "@shopify/hydrogen/storefront-api-types";
import { clsx } from "clsx";
import type { CSSProperties } from "react";
import { Link } from "~/components/link";
import { Overlay, type OverlayProps } from "~/components/overlay";
import { getImageAspectRatio } from "~/utils/image";

interface CollectionCardProps extends OverlayProps {
  collection: Collection;
  imageAspectRatio: string;
  collectionNameColor: string;
  loading?: HTMLImageElement["loading"];
}

export function CollectionCard({
  collection,
  imageAspectRatio,
  collectionNameColor,
  loading,
  enableOverlay,
  overlayColor,
  overlayColorHover,
  overlayOpacity,
}: CollectionCardProps) {
  return (
    <Link
      to={`/collections/${collection.handle}`}
      className="flex flex-col gap-2"
      style={
        {
          "--aspect-ratio": getImageAspectRatio(
            collection?.image,
            imageAspectRatio
          ),
        } as CSSProperties
      }
    >
      <div className="aspect-[--aspect-ratio] group relative flex items-center justify-center overflow-hidden">
        {collection?.image ? (
          <Image
            data={collection.image}
            width={collection.image.width || 600}
            height={collection.image.height || 400}
            aspectRatio={imageAspectRatio}
            sizes="(max-width: 32em) 100vw, 45vw"
            loading={loading}
            className={clsx(
              "object-cover object-center absolute z-0 inset-0",
              "transition-all duration-300",
              "will-change-transform scale-100 group-hover:scale-[1.03]"
            )}
          />
        ) : null}
        <h5 style={{ color: collectionNameColor }} className="z-1">
          {collection.title}
        </h5>
        <Overlay
          enableOverlay={enableOverlay}
          overlayColor={overlayColor}
          overlayColorHover={overlayColorHover}
          overlayOpacity={overlayOpacity}
          className="z-0"
        />
      </div>
    </Link>
  );
}
