import { Image } from "@shopify/hydrogen";
import type { Collection } from "@shopify/hydrogen/storefront-api-types";
import { Link } from "~/components/link";
import { Heading } from "~/modules/text";

export function CollectionCard({
  collection,
  imageAspectRatio,
  loading,
}: {
  collection: Collection;
  imageAspectRatio: string;
  loading?: HTMLImageElement["loading"];
}) {
  return (
    <Link
      to={`/collections/${collection.handle}`}
      className="flex flex-col gap-2"
    >
      <div className="bg-background/5 aspect-[3/4]">
        {collection?.image && (
          <Image
            data={collection.image}
            width={collection.image.width || 600}
            height={collection.image.height || 400}
            aspectRatio={imageAspectRatio}
            sizes="(max-width: 32em) 100vw, 45vw"
            loading={loading}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <h6>{collection.title}</h6>
    </Link>
  );
}
