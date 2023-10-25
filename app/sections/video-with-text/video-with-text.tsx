import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { CSSProperties } from 'react';
import ReactPlayer from 'react-player/youtube';

interface VideoWithTextProps extends HydrogenComponentProps {
  videoLink: string;
  enableOverlay: boolean;
  overlayColor: string;
  overlayOpacity: number;
  sectionHeightDesktop: number;
  sectionHeightMobile: number;
  enableAutoPlay: boolean;
  enableLoop: boolean;
  enableMuted: boolean;
  contentAlignment: string;
}

let VideoWithText = forwardRef<HTMLElement, VideoWithTextProps>((props, ref) => {
  let { videoLink, enableOverlay, overlayColor, overlayOpacity, sectionHeightDesktop, sectionHeightMobile, enableAutoPlay, enableLoop, enableMuted, contentAlignment, children, ...rest } = props;
  let sectionStyle: CSSProperties = {
    justifyContent: `${contentAlignment}`,
    '--section-height-desktop': `${sectionHeightDesktop}px`,
    '--section-height-mobile': `${sectionHeightMobile}px`,
    '--overlay-opacity': `${overlayOpacity}%`,
    '--overlay-color': `${overlayColor}`,
  } as CSSProperties;

  return (
    <section ref={ref} {...rest} className='flex relative items-center text-center overflow-hidden h-[var(--section-height-mobile)] sm:h-[var(--section-height-desktop)] text-white' style={sectionStyle}>
      {videoLink ? <ReactPlayer url={videoLink}
        playing={enableAutoPlay}
        volume={1} muted={enableMuted}
        loop={enableLoop} width={'100%'}
        height={'auto'}
        className='absolute aspect-video'
        controls={false} /> :
        <div className='absolute inset-0 flex items-center justify-center bg-gray-200'>
          <svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M101.519 68.8267C89.3402 61.6363 75.6249 71.4144 75.6249 84.454V135.546C75.6249 148.586 89.3403 158.364 101.519 151.173L144.787 125.627C156.46 118.736 156.46 101.264 144.787 94.3727L101.519 68.8267ZM89.3749 84.454C89.3749 82.6346 90.2562 81.362 91.295 80.7124C92.3003 80.0838 93.4252 80.0158 94.5282 80.667L137.797 106.213C139.013 106.931 139.791 108.302 139.791 110C139.791 111.698 139.013 113.069 137.797 113.787L94.5282 139.333C93.4252 139.984 92.3003 139.916 91.295 139.288C90.2562 138.638 89.3749 137.365 89.3749 135.546V84.454Z" fill="#0F0F0F" fill-opacity="0.05" />
            <path fill-rule="evenodd" clip-rule="evenodd" d="M110 11.4585C55.5769 11.4585 11.4583 55.577 11.4583 110C11.4583 164.423 55.5769 208.542 110 208.542C164.423 208.542 208.541 164.423 208.541 110C208.541 55.577 164.423 11.4585 110 11.4585ZM25.2083 110C25.2083 63.171 63.1708 25.2085 110 25.2085C156.829 25.2085 194.791 63.171 194.791 110C194.791 156.829 156.829 194.792 110 194.792C63.1708 194.792 25.2083 156.829 25.2083 110Z" fill="#0F0F0F" fill-opacity="0.05" />
          </svg>
        </div>}
      {enableOverlay && <div className='absolute inset-0 bg-[var(--overlay-color)] opacity-[var(--overlay-opacity)]'></div>}
      <div className='relative mx-12 sm-max:mx-0 sm-max:w-5/6 z-10'>
        {children}
      </div>
    </section>
  );
});

export default VideoWithText;

export let schema: HydrogenComponentSchema = {
  type: 'video-with-text',
  title: 'Video with text',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Video',
      inputs: [
        {
          type: 'text',
          name: 'videoLink',
          label: 'Video link',
          defaultValue: 'https://www.youtube.com/embed/_9VUPq3SxOc',
          placeholder: 'https://',
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
          defaultValue: '#333333',
          condition: `enableOverlay.eq.true`,
        },
        {
          type: 'range',
          name: 'overlayOpacity',
          label: 'Overlay opacity',
          defaultValue: 50,
          configs: {
            min: 10,
            max: 100,
            step: 10,
            unit: '%',
          },
          condition: `enableOverlay.eq.true`
        },
        {
          type: 'toggle-group',
          label: 'Content alignment',
          name: 'contentAlignment',
          configs: {
            options: [
              { label: 'Left', value: 'flex-start' },
              { label: 'Center', value: 'center' },
              { label: 'Right', value: 'flex-end' },
            ],
          },
          defaultValue: 'center',
        },
        {
          type: 'range',
          name: 'sectionHeightDesktop',
          label: 'Section height desktop',
          defaultValue: 450,
          configs: {
            min: 400,
            max: 500,
            step: 10,
            unit: 'px',
          },
        },
        {
          type: 'range',
          name: 'sectionHeightMobile',
          label: 'Section height mobile',
          defaultValue: 250,
          configs: {
            min: 200,
            max: 300,
            step: 10,
            unit: 'px',
          },
        },
        {
          type: 'switch',
          name: 'enableAutoPlay',
          label: 'Auto play',
          defaultValue: true,
        },
        {
          type: 'switch',
          name: 'enableLoop',
          label: 'Loop',
          defaultValue: true,
        },
        {
          type: 'switch',
          name: 'enableMuted',
          label: 'Muted',
          defaultValue: true,
        },
      ],
    },
  ],
  childTypes: ['video-subheading--item', 'video-heading--item', 'video-description--item', 'video-button--item'],
  presets: {
    children: [
      {
        type: 'video-heading--item',
      },
      {
        type: 'video-subheading--item',
      },
      {
        type: 'video-description--item',
      },
      {
        type: 'video-button--item',
      }
    ],
  },
};
