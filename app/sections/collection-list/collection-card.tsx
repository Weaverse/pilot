import type { Collection } from "@shopify/hydrogen/storefront-api-types";
import { clsx } from "clsx";
import type { CSSProperties } from "react";
import { Image } from "~/components/image";
import { Link } from "~/components/link";
import { Overlay, type OverlayProps } from "~/components/overlay";
import type { ImageAspectRatio } from "~/types/image";
import { getImageAspectRatio } from "~/utils/image";

interface CollectionCardProps extends OverlayProps {
  collection: Collection;
  imageAspectRatio: ImageAspectRatio;
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
  if (collection.products.nodes.length === 0) {
    return null;
  }

  let collectionImage = collection.image;
  if (!collectionImage) {
    let collectionProducts = collection.products.nodes;
    if (collectionProducts.length > 0) {
      let firstProduct = collectionProducts[0];
      if (firstProduct.media.nodes.length > 0) {
        let firstProductMedia = firstProduct.media.nodes[0];
        if (firstProductMedia.previewImage) {
          collectionImage = firstProductMedia.previewImage;
        }
      }
    }
  }
  return (
    <Link
      to={`/collections/${collection.handle}`}
      className="flex flex-col gap-2"
      style={
        {
          "--aspect-ratio": getImageAspectRatio(
            collection?.image,
            imageAspectRatio,
          ),
        } as CSSProperties
      }
    >
      <div className="aspect-[--aspect-ratio] group relative flex items-center justify-center overflow-hidden">
        {collectionImage ? (
          <Image
            data={collectionImage}
            width={collectionImage.width || 600}
            height={collectionImage.height || 400}
            sizes="(max-width: 32em) 100vw, 45vw"
            loading={loading}
            className={clsx(
              "absolute z-0 inset-0",
              "transition-all duration-300",
              "will-change-transform scale-100 group-hover:scale-[1.03]",
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
