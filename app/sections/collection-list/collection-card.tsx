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
  contentPosition: "over" | "below";
  collectionNameColor: string;
  showProductCount: boolean;
  loading?: HTMLImageElement["loading"];
}

export function CollectionCard({
  collection,
  imageAspectRatio,
  contentPosition,
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
  let contentOver = contentPosition === "over";

  let content = (
    <div
      className={clsx(
        "flex flex-col gap-1",
        contentOver ? "z-1 items-center" : "items-start",
      )}
    >
      <h6
        style={contentOver ? { color: collectionNameColor } : undefined}
        className="text-center"
      >
        {collection.title}
      </h6>
      {showProductCount && productCount !== null && (
        <span
          style={contentOver ? { color: collectionNameColor } : undefined}
          className={clsx(
            "text-sm",
            contentOver ? "text-center opacity-80" : "text-body-subtle",
          )}
        >
          {productCount}{" "}
          {typeof productCount === "number" && productCount === 1
            ? "product"
            : "products"}
        </span>
      )}
    </div>
  );

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
        {contentOver && content}
        <Overlay
          enableOverlay={enableOverlay}
          overlayColor={overlayColor}
          overlayColorHover={overlayColorHover}
          overlayOpacity={overlayOpacity}
          className="z-0"
        />
      </div>
      {!contentOver && content}
    </Link>
  );
}
