import {Image} from '@shopify/hydrogen';
import type {Collection} from '@shopify/hydrogen/storefront-api-types';
import {Heading, Link} from '~/components';

export function CollectionCard({
  collection,
  imageAspectRatio,
  loading,
}: {
  collection: Collection;
  imageAspectRatio: string;
  loading?: HTMLImageElement['loading'];
}) {
  return (
    <Link to={`/collections/${collection.handle}`} className="grid gap-4">
      <div className="card-image bg-primary/5 aspect-[3/2]">
        {collection?.image && (
          <Image
            data={collection.image}
            width={collection.image.width || 600}
            height={collection.image.height || 400}
            aspectRatio={imageAspectRatio}
            sizes="(max-width: 32em) 100vw, 45vw"
            loading={loading}
          />
        )}
      </div>
      <Heading as="h3" size="copy">
        {collection.title}
      </Heading>
    </Link>
  );
}
