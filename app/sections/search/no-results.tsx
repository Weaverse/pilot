import {Await} from '@remix-run/react';
import {Suspense} from 'react';

import {
  FeaturedCollections,
  ProductSwimlane,
  Section,
  Text,
} from '~/components';
import {FeaturedData} from '~/routes/($locale).featured-products';

export function NoResults({
  noResults,
  recommendations,
  noResultsText,
  showRelatedCollections,
  relatedCollectionsTitle,
  showRelatedProducts,
  relatedProductsTitle,
}: {
  noResults: boolean;
  recommendations: FeaturedData | null;
  noResultsText: string;
  showRelatedCollections: boolean;
  relatedCollectionsTitle: string;
  showRelatedProducts: boolean;
  relatedProductsTitle: string;
}) {
  return (
    <>
      {noResults && (
        <Section padding="x">
          <Text className="opacity-50">{noResultsText}</Text>
        </Section>
      )}
      <Suspense>
        <Await
          errorElement="There was a problem loading related products"
          resolve={recommendations}
        >
          {(result) => {
            if (!result) return null;
            const {featuredCollections, featuredProducts} = result;

            return (
              <>
                {showRelatedCollections && (
                  <FeaturedCollections
                    title={relatedCollectionsTitle}
                    collections={featuredCollections}
                  />
                )}
                {showRelatedProducts && (
                  <ProductSwimlane
                    title={relatedProductsTitle}
                    products={featuredProducts}
                  />
                )}
              </>
            );
          }}
        </Await>
      </Suspense>
    </>
  );
}
