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
  let {
    selectedVariant,
    media: _media,
    showThumbnails,
    numberOfThumbnails,
    spacing,
  } = props;
  let media = _media.filter((med) => med.__typename === 'MediaImage');

  let slideOptions = {
    initial: 0,
    loop: true,
    slides: {
      perView: 1,
      spacing: 0,
    },
  };

  let thumbnailOptions = {
    initial: 0,
    slides: {
      perView: numberOfThumbnails,
      spacing: spacing,
    },
  };

  let [activeInd, setAcitveInd] = useState(0);
  const [sliderRef, instanceRef] = useKeenSlider({
    ...slideOptions,
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
  const [thumbnailRef, thumbnailInstance] = useKeenSlider(thumbnailOptions);
  let handleClickThumbnail = (idx: number) => {
    moveToIdx(idx);
  };

  useEffect(() => {
    // instanceRef.current?.update(slideOptions);
    // thumbnailInstance.current?.update(thumbnailOptions);
    let selectedInd = media.findIndex((med) => {
      if (med.__typename !== 'MediaImage') return false;
      return med.image?.url === selectedVariant.image.url;
    });
    moveToIdx(selectedInd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant?.id, moveToIdx]);
  return (
    <div
      className="grid vt-product-image"
      style={{
        gap: spacing,
      }}
    >
      <div ref={sliderRef} className="keen-slider">
        {media.map((med, i) => {
          let image =
            med.__typename === 'MediaImage'
              ? {...med.image, altText: med.alt || 'Product image'}
              : null;
          return (
            image && (
              <div className="keen-slider__slide" key={med.id}>
                <Image
                  data={image}
                  loading={i === 0 ? 'eager' : 'lazy'}
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
            let image =
              med.__typename === 'MediaImage'
                ? {...med.image, altText: med.alt || 'Product image'}
                : null;
            return (
              image && (
                <div
                  key={med.id}
                  className={clsx(
                    'keen-slider__slide border-2 cursor-pointer',
                    i === activeInd ? 'border-bar/70' : '',
                  )}
                  onClick={() => handleClickThumbnail(i)}
                >
                  <Image
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
