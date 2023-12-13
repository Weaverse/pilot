import {Image} from '@shopify/hydrogen';
import clsx from 'clsx';
import {useKeenSlider} from 'keen-slider/react';
import {useCallback, useEffect, useState} from 'react';
import type {MediaFragment} from 'storefrontapi.generated';

interface ProductMediaProps {
  selectedVariant: any;
  media: MediaFragment[];
  showThumbnails: boolean;
  numberOfThumbnails: number;
  spacing: number;
}

export function ProductMedia(props: ProductMediaProps) {
  let {selectedVariant, media, showThumbnails, numberOfThumbnails, spacing} =
    props;
  let [activeInd, setAcitveInd] = useState(0);
  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slideChanged(slider) {
      let pos = slider.track.details.rel;
      setAcitveInd(pos);
      let maxThumbnailIndex =
        thumbnailInstance.current?.track.details.maxIdx || 0;
      let thumbnailNext = Math.min(
        Math.floor((pos + 1) / numberOfThumbnails),
        maxThumbnailIndex,
      );
      thumbnailInstance.current?.moveToIdx(thumbnailNext);
    },
  });
  let moveToIdx = useCallback(
    (idx: number) => {
      setAcitveInd(idx);
      if (instanceRef.current) {
        instanceRef.current.moveToIdx(idx);
      }
    },
    [instanceRef],
  );
  const [thumbnailRef, thumbnailInstance] = useKeenSlider({
    initial: 0,
    slides: {
      perView: numberOfThumbnails,
      spacing: spacing,
    },
  });
  let handleClickThumbnail = (idx: number) => {
    moveToIdx(idx);
  };
  useEffect(() => {
    let selectedInd = media.findIndex((med) => {
      if (med.__typename !== 'MediaImage') return false;
      return med.image?.url === selectedVariant.image.url;
    });
    moveToIdx(selectedInd);
  }, [selectedVariant, media, moveToIdx]);
  return (
    <div>
      <div ref={sliderRef} className="keen-slider">
        {media.map((med, i) => {
          const image =
            med.__typename === 'MediaImage'
              ? {...med.image, altText: med.alt || 'Product image'}
              : null;
          return (
            image && (
              <div className="keen-slider__slide">
                <Image
                  key={i}
                  data={image}
                  loading={'lazy'}
                  aspectRatio={'4/5'}
                  className="object-cover w-full h-full aspect-square fadeIn"
                />
              </div>
            )
          );
        })}
      </div>
      {showThumbnails && (
        <div ref={thumbnailRef} className="keen-slider thumbnail">
          {media.map((med, i) => {
            const image =
              med.__typename === 'MediaImage'
                ? {...med.image, altText: med.alt || 'Product image'}
                : null;
            return (
              image && (
                <div
                  className={clsx(
                    'keen-slider__slide border-2 cursor-pointer',
                    i === activeInd ? 'border-bar/70' : '',
                  )}
                  onClick={() => handleClickThumbnail(i)}
                >
                  <Image
                    key={i}
                    data={image}
                    loading="lazy"
                    width={200}
                    sizes="100px 100w, 300px 300w, 500px 500w, 1000px 1000w"
                    aspectRatio="1/1"
                    className="object-cover w-full h-full aspect-square fadeIn"
                  />
                </div>
              )
            );
          })}
        </div>
      )}
    </div>
  );
}
