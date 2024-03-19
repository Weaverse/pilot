import type {HydrogenComponentSchema} from '@weaverse/hydrogen';
import clsx from 'clsx';
import type {CSSProperties} from 'react';
import {forwardRef} from 'react';
import ReactPlayer from 'react-player/youtube';
import type {SectionWidth, VerticalPadding} from '~/sections/shared/Section';
import {
  gapClasses,
  verticalPaddingClasses,
  widthClasses,
} from '~/sections/shared/Section';

type VideoHeroProps = {
  videoURL: string;
  width: SectionWidth;
  verticalPadding: VerticalPadding;
  gap: number;
  enableOverlay: boolean;
  overlayColor: string;
  overlayOpacity: number;
  sectionHeightDesktop: number;
  sectionHeightMobile: number;
  children: React.ReactNode;
};

let FALLBACK_VIDEO = 'https://www.youtube.com/embed/Su-x4Mo5xmU';

let VideoHero = forwardRef<HTMLElement, VideoHeroProps>((props, ref) => {
  let {
    videoURL,
    width,
    gap,
    verticalPadding,
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
      className={clsx(
        'overflow-hidden',
        widthClasses[width],
        verticalPaddingClasses[verticalPadding],
      )}
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
            'absolute inset-0 flex items-center flex-col justify-center z-10 text-white',
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
          name: 'videoLink',
          label: 'Video URL',
          defaultValue: 'https://www.youtube.com/embed/Su-x4Mo5xmU',
          placeholder: 'https://www.youtube.com/embed/Su-x4Mo5xmU',
          helpText:
            'How to get YouTube <a target="_blank" href="https://support.google.com/youtube/answer/171780?hl=en#:~:text=On%20a%20computer%2C%20go%20to,appears%2C%20copy%20the%20HTML%20code.">embed code</a>.',
        },
        {
          type: 'heading',
          label: 'Layout',
        },
        {
          type: 'select',
          name: 'width',
          label: 'Content width',
          configs: {
            options: [
              {value: 'full', label: 'Full page'},
              {value: 'stretch', label: 'Stretch'},
              {value: 'fixed', label: 'Fixed'},
            ],
          },
          defaultValue: 'full',
        },
        {
          type: 'select',
          name: 'verticalPadding',
          label: 'Vertical padding',
          configs: {
            options: [
              {value: 'none', label: 'None'},
              {value: 'small', label: 'Small'},
              {value: 'medium', label: 'Medium'},
              {value: 'large', label: 'Large'},
            ],
          },
          defaultValue: 'none',
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
          label: 'Items spacing',
          configs: {
            min: 0,
            max: 40,
            step: 4,
            unit: 'px',
          },
          defaultValue: 20,
        },
        {
          type: 'heading',
          label: 'Overlay',
        },
        {
          type: 'switch',
          name: 'enableOverlay',
          label: 'Enable overlay',
          defaultValue: true,
        },
        {
          type: 'color',
          name: 'overlayColor',
          label: 'Overlay color',
          defaultValue: '#000000',
          condition: 'enableOverlay.eq.true',
        },
        {
          type: 'range',
          name: 'overlayOpacity',
          label: 'Overlay opacity',
          defaultValue: 50,
          configs: {
            min: 0,
            max: 100,
            step: 1,
            unit: '%',
          },
          condition: 'enableOverlay.eq.true',
        },
      ],
    },
  ],
  childTypes: ['subheading', 'heading', 'description', 'button'],
  presets: {
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
