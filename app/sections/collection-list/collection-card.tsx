import type { Collection } from "@shopify/hydrogen/storefront-api-types";
import { clsx } from "clsx";
import { type CSSProperties, useEffect, useState } from "react";
import { Image } from "~/components/image";
import { Link } from "~/components/link";
import { Overlay, type OverlayProps } from "~/components/overlay";
import type { ImageAspectRatio } from "~/types/others";
import { calculateAspectRatio } from "~/utils/image";

interface CollectionCardProps extends OverlayProps {
  collection: Collection;
  imageAspectRatio: ImageAspectRatio;
  collectionNameColor: string;
  showProductCount: boolean;
  loading?: HTMLImageElement["loading"];
}

export function CollectionCard({
  collection,
  imageAspectRatio,
  collectionNameColor,
  showProductCount,
  loading,
  enableOverlay,
  overlayColor,
  overlayColorHover,
  overlayOpacity,
}: CollectionCardProps) {
  let [productCount, setProductCount] = useState<string | number | null>(null);

  useEffect(() => {
    if (!showProductCount) {
      return;
    }
    fetch(`/api/collection/${collection.handle}/product-count`)
      .then((res) => res.json())
      .then((data: { count: number | string }) => setProductCount(data.count))
      .catch(() => setProductCount(null));
  }, [collection.handle, showProductCount]);

  if (collection.products.nodes.length === 0) {
    return null;
  }

  let collectionImage = collection.image;
  if (!collectionImage) {
    const collectionProducts = collection.products.nodes;
    if (collectionProducts.length > 0) {
      const firstProduct = collectionProducts[0];
      if (firstProduct.media.nodes.length > 0) {
        const firstProductMedia = firstProduct.media.nodes[0];
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
          "--aspect-ratio": calculateAspectRatio(
            collection?.image,
            imageAspectRatio,
          ),
        } as CSSProperties
      }
    >
      <div className="group relative flex aspect-(--aspect-ratio) items-center justify-center overflow-hidden rounded-md">
        {collectionImage ? (
          <Image
            data={collectionImage}
            width={collectionImage.width || 600}
            height={collectionImage.height || 400}
            sizes="(max-width: 32em) 100vw, 45vw"
            loading={loading}
            className={clsx(
              "absolute inset-0 z-0",
              "transition-all duration-300",
              "scale-100 will-change-transform group-hover:scale-[1.03]",
            )}
          />
        ) : null}
        <div className="z-1 flex flex-col items-center gap-1">
          <h5 style={{ color: collectionNameColor }} className="text-center">
            {collection.title}
          </h5>
          {showProductCount && productCount !== null && (
            <span
              style={{ color: collectionNameColor }}
              className="text-center text-sm opacity-80"
            >
              {productCount}{" "}
              {typeof productCount === "number" && productCount === 1
                ? "product"
                : "products"}
            </span>
          )}
        </div>
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
