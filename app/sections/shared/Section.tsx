import {
  type HydrogenComponentProps,
  type InspectorGroup,
} from '@weaverse/hydrogen';
import clsx from 'clsx';
import type {HTMLAttributes} from 'react';
import React, {forwardRef} from 'react';
import type {BackgroundImageProps} from './BackgroundImage';
import {BackgroundImage, backgroundImageInputs} from './BackgroundImage';
import {Overlay, overlayInputs} from './Overlay';

export type SectionWidth = 'full' | 'stretch' | 'fixed';
export type VerticalPadding = 'none' | 'small' | 'medium' | 'large';
export type DividerType = 'none' | 'top' | 'bottom' | 'both';

export type SectionProps = HydrogenComponentProps &
  HTMLAttributes<HTMLElement> &
  BackgroundImageProps & {
    as?: React.ElementType;
    width?: SectionWidth;
    gap?: number;
    children?: React.ReactNode;
    className?: string;
    verticalPadding?: VerticalPadding;
    divider?: DividerType;
    enableOverlay?: boolean;
    overlayColor?: string;
    overlayOpacity?: number;
    backgroundColor?: string;
  };

let gapClasses: Record<number, string> = {
  0: '',
  4: 'space-y-1',
  8: 'space-y-2',
  12: 'space-y-3',
  16: 'space-y-4',
  20: 'space-y-5',
};

let verticalPaddingClasses: Record<VerticalPadding, string> = {
  none: '',
  small: 'py-4 md:py-6 lg:py-8',
  medium: 'py-8 md:py-12 lg:py-16',
  large: 'py-12 md:py-24 lg:py-32',
};

let widthClasses: Record<SectionWidth, string> = {
  full: 'w-full',
  stretch: 'w-full px-6 md:px-8 lg:px-12',
  fixed: 'max-w-screen-xl px-3 md:px-4 lg:px-6 mx-auto',
};

export let Section = forwardRef<HTMLElement, SectionProps>((props, ref) => {
  let {
    as: Component = 'section',
    width,
    gap,
    divider,
    verticalPadding,
    backgroundColor,
    backgroundImage,
    backgroundFit,
    backgroundPosition,
    enableOverlay,
    overlayColor,
    overlayOpacity,
    className,
    children,
    ...rest
  } = props;
  return (
    <>
      {(divider === 'top' || divider === 'both') && <Divider />}
      <Component
        ref={ref}
        {...rest}
        className={clsx(
          'relative',
          verticalPaddingClasses[verticalPadding!],
          className,
        )}
        style={{
          backgroundColor,
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : '',
          backgroundSize: backgroundFit,
          backgroundPosition,
        }}
      >
        {backgroundImage && (
          <BackgroundImage
            backgroundImage={backgroundImage}
            backgroundFit={backgroundFit}
            backgroundPosition={backgroundPosition}
          />
        )}
        {enableOverlay && (
          <Overlay color={overlayColor!} opacity={overlayOpacity!} />
        )}
        <div
          className={clsx('relative', widthClasses[width!], gapClasses[gap!])}
        >
          {children}
        </div>
      </Component>
      {(divider === 'bottom' || divider === 'both') && <Divider />}
    </>
  );
});

function Divider() {
  return <div className="border-t w-2/3 lg:w-1/2 mx-auto" />;
}

Section.defaultProps = {
  as: 'section',
  width: 'fixed',
  gap: 0,
  verticalPadding: 'medium',
  divider: 'none',
  enableOverlay: false,
  overlayColor: '#000000',
  overlayOpacity: 50,
};

export let layoutInputs: InspectorGroup['inputs'] = [
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
    defaultValue: 'fixed',
  },
  {
    type: 'range',
    name: 'gap',
    label: 'Items gap',
    configs: {
      min: 0,
      max: 20,
      step: 4,
      unit: 'px',
    },
    defaultValue: 0,
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
    defaultValue: 'medium',
  },
  {
    type: 'select',
    name: 'divider',
    label: 'Divider',
    configs: {
      options: [
        {value: 'none', label: 'None'},
        {value: 'top', label: 'Top'},
        {value: 'bottom', label: 'Bottom'},
        {value: 'both', label: 'Both'},
      ],
    },
    defaultValue: 'none',
  },
];

export let sectionConfigs: InspectorGroup = {
  group: 'General',
  inputs: [...layoutInputs, ...backgroundImageInputs, ...overlayInputs],
};
