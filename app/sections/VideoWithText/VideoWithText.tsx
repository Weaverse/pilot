import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import type {CSSProperties} from 'react';
import {forwardRef} from 'react';
import ReactPlayer from 'react-player/youtube';
import {IconVideoBlank} from '~/components';

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

let VideoWithText = forwardRef<HTMLElement, VideoWithTextProps>(
  (props, ref) => {
    let {
      videoLink,
      enableOverlay,
      overlayColor,
      overlayOpacity,
      sectionHeightDesktop,
      sectionHeightMobile,
      enableAutoPlay,
      enableLoop,
      enableMuted,
      contentAlignment,
      children,
      ...rest
    } = props;
    let sectionStyle: CSSProperties = {
      justifyContent: `${contentAlignment}`,
      '--section-height-desktop': `${sectionHeightDesktop}px`,
      '--section-height-mobile': `${sectionHeightMobile}px`,
      '--overlay-opacity': `${overlayOpacity}%`,
      '--overlay-color': `${overlayColor}`,
      '--max-width-content': '600px',
    } as CSSProperties;

    return (
      <section
        ref={ref}
        {...rest}
        className="flex relative overflow-hidden items-center h-[var(--section-height-mobile)] sm:h-[var(--section-height-desktop)]"
        style={sectionStyle}
      >
        {videoLink ? (
          <ReactPlayer
            url={videoLink}
            playing={enableAutoPlay}
            volume={1}
            muted={enableMuted}
            loop={enableLoop}
            width={'100%'}
            height={'auto'}
            className="absolute aspect-video"
            controls={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <IconVideoBlank viewBox="0 0 220 220" className="!w-56 !h-56" />
          </div>
        )}
        {enableOverlay && (
          <div className="absolute inset-0 bg-[var(--overlay-color)] opacity-[var(--overlay-opacity)]"></div>
        )}
        <div className="relative text-center flex flex-col gap-5 mx-12 w-[var(--max-width-content)] sm-max:mx-0 sm-max:w-5/6 z-10">
          {children}
        </div>
      </section>
    );
  },
);

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
          condition: `enableOverlay.eq.true`,
        },
        {
          type: 'toggle-group',
          label: 'Content alignment',
          name: 'contentAlignment',
          configs: {
            options: [
              {label: 'Left', value: 'flex-start'},
              {label: 'Center', value: 'center'},
              {label: 'Right', value: 'flex-end'},
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
  childTypes: ['subheading', 'heading', 'description', 'button'],
  presets: {
    children: [
      {
        type: 'subheading',
        content: 'Subheading',
      },
      {
        type: 'heading',
        content: 'Heading for Video',
      },
      {
        type: 'description',
        content: 'Pair large text with an image to tell a story.',
      },
      {
        type: 'button',
        content: 'Button section',
      },
    ],
  },
};
