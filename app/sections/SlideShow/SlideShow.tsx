import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef, CSSProperties, useState, useCallback, useEffect } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import clsx from 'clsx';

interface SlideShowProps extends HydrogenComponentProps {
  sectionHeight: number;
}

let SlideShow = forwardRef<HTMLElement, SlideShowProps>((props, ref) => {
  let {
    sectionHeight,
    children,
    ...rest
  } = props;
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slideChanged(slider) {
      let pos = slider.track.details.rel;
      setActiveIndex(pos);
    },
  });

  let moveToIdx = useCallback(
    (idx: number) => {
      setActiveIndex(idx);
      if (instanceRef.current) {
        instanceRef.current.moveToIdx(idx);
      }
    },
    [instanceRef],
  );

  let handleClickNavigation = (idx: number) => {
    moveToIdx(idx);
  };

  let renderNavigation = () => {
    if (children && children?.length > 1) {
      return children?.map((child, index) => (
        <span
          key={index}
          className={clsx('h-1 w-full cursor-pointer rounded-sm', index === activeIndex ? 'bg-gray-700' : 'bg-gray-300')}
          onClick={() => handleClickNavigation(index)}
        ></span>
      ));
    }
    return null;
  };

  useEffect(() => {
    if (instanceRef) {
      instanceRef.current?.update();
    }
  }, [children, instanceRef]);

  let sectionStyle: CSSProperties = {
    '--section-height': `${sectionHeight}px`,
  } as CSSProperties;

  return (
    <section
      ref={ref}
      {...rest}
      className="h-[var(--section-height)] relative"
      style={sectionStyle}
    >
      <div ref={sliderRef} className='keen-slider h-full'>
        {children?.map((child, index) => (
          <div
            key={index}
            className={clsx('keen-slider__slide')}
          >
            {child}
          </div>
        ))}
      </div>
      <div className='absolute bottom-7 left-1/2 w-1/3 transform -translate-x-1/2 flex gap-1'>
          {renderNavigation()}
      </div>
    </section>
  );
});

export default SlideShow;

export let schema: HydrogenComponentSchema = {
  type: 'slide-show',
  title: 'Slide show',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'SLideshow',
      inputs: [
        {
          type: 'range',
          name: 'sectionHeight',
          label: 'Section height',
          defaultValue: 500,
          configs: {
            min: 400,
            max: 700,
            step: 10,
            unit: 'px',
          },
        },
      ],
    },
  ],
  childTypes: ['slide-show--item'],
  presets: {
    children: [
      {
        type: 'slide-show--item',
      },
    ],
  },
};
