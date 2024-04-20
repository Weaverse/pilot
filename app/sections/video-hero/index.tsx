import type {HydrogenComponentSchema} from '@weaverse/hydrogen';
import clsx from 'clsx';
import type {CSSProperties} from 'react';
import {forwardRef, lazy, Suspense} from 'react';

import {overlayInputs} from '~/sections/shared/Overlay';
import {gapClasses} from '~/sections/shared/Section';

type VideoHeroProps = {
  videoURL: string;
  gap: number;
  enableOverlay: boolean;
  overlayColor: string;
  overlayOpacity: number;
  sectionHeightDesktop: number;
  sectionHeightMobile: number;
  children: React.ReactNode;
};
let RP = lazy(() => import('react-player/lazy'));
let ReactPlayer = (props: any) => (
  <Suspense fallback={null}>
    <RP {...props} />
  </Suspense>
);
let FALLBACK_VIDEO = 'https://www.youtube.com/watch?v=Su-x4Mo5xmU';

let VideoHero = forwardRef<HTMLElement, VideoHeroProps>((props, ref) => {
  let {
    videoURL,
    gap,
    sectionHeightDesktop,
    sectionHeightMobile,
    children,
    enableOverlay,
    overlayColor,
    overlayOpacity,
    ...rest
  } = props;
  let sectionStyle: CSSProperties = {
    '--desktop-height': `${sectionHeightDesktop}px`,
    '--mobile-height': `${sectionHeightMobile}px`,
  } as CSSProperties;

  return (
    <section
      ref={ref}
      {...rest}
      className="overflow-hidden w-full h-full"
      style={sectionStyle}
    >
      <div
        className={clsx(
          'flex items-center justify-center relative overflow-hidden',
          'h-[var(--mobile-height)] sm:h-[var(--desktop-height)]',
          'w-[max(var(--mobile-height)/9*16,100vw)] sm:w-[max(var(--desktop-height)/9*16,100vw)]',
          'translate-x-[min(0px,calc((var(--mobile-height)/9*16-100vw)/-2))] sm:translate-x-[min(0px,calc((var(--desktop-height)/9*16-100vw)/-2))]',
        )}
      >
        <ReactPlayer
          url={videoURL || FALLBACK_VIDEO}
          playing
          muted
          loop
          width="100%"
          height="auto"
          controls={false}
          className="aspect-video"
        />
        {enableOverlay ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: overlayColor,
              opacity: (overlayOpacity || 50) / 100,
            }}
          />
        ) : null}
        <div
          className={clsx(
            'absolute inset-0 max-w-[100vw] mx-auto px-3 flex flex-col justify-center z-10',
            gapClasses[gap],
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
});

export default VideoHero;

export let schema: HydrogenComponentSchema = {
  type: 'video-hero',
  title: 'Video hero',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Video hero',
      inputs: [
        {
          type: 'text',
          name: 'videoURL',
          label: 'Video URL',
          defaultValue: 'https://www.youtube.com/watch?v=Su-x4Mo5xmU',
          placeholder: 'https://www.youtube.com/watch?v=Su-x4Mo5xmU',
          helpText: 'Support YouTube, Vimeo, MP4, WebM, and HLS streams.',
        },
        {
          type: 'heading',
          label: 'Layout',
        },
        {
          type: 'range',
          name: 'sectionHeightDesktop',
          label: 'Height on desktop',
          defaultValue: 650,
          configs: {
            min: 400,
            max: 800,
            step: 10,
            unit: 'px',
          },
        },
        {
          type: 'range',
          name: 'sectionHeightMobile',
          label: 'Height on mobile',
          defaultValue: 300,
          configs: {
            min: 250,
            max: 500,
            step: 10,
            unit: 'px',
          },
        },
        {
          type: 'range',
          name: 'gap',
          label: 'Content spacing',
          configs: {
            min: 0,
            max: 40,
            step: 4,
            unit: 'px',
          },
          defaultValue: 20,
        },
        ...overlayInputs,
      ],
    },
  ],
  childTypes: ['subheading', 'heading', 'description', 'button'],
  presets: {
    enableOverlay: true,
    children: [
      {
        type: 'subheading',
        content: 'Seamless hero videos',
      },
      {
        type: 'heading',
        content: 'Bring your brand to life.',
      },
      {
        type: 'description',
        content:
          'Pair large video with a compelling message to captivate your audience.',
      },
    ],
  },
};
