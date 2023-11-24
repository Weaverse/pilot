import {InspectorGroup} from '@weaverse/hydrogen';
import clsx from 'clsx';
import React, {HTMLAttributes, forwardRef} from 'react';

export type ContainerWidth = 'full' | 'stretch' | 'fixed';
export type VerticalPadding = 'none' | 'small' | 'medium' | 'large';
export type Divider = 'none' | 'top' | 'bottom' | 'both';

export type ContainerProps = HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  width?: ContainerWidth;
  children?: React.ReactNode;
  className?: string;
  verticalPadding?: VerticalPadding;
  divider?: Divider;
};

let dividerClasses: Record<Divider, string> = {
  none: '',
  top: 'border-t',
  bottom: 'border-b',
  both: 'border-y',
};

let verticalPaddingClasses: Record<VerticalPadding, string> = {
  none: '',
  small: 'py-4 md:py-6 lg:py-8',
  medium: 'py-6 md:py-8 lg:py-12',
  large: 'py-8 md:py-12 lg:py-16',
};

let widthClasses: Record<ContainerWidth, string> = {
  full: 'w-full',
  stretch: 'w-full px-6 md:px-8 lg:px-12',
  fixed: 'max-w-screen-xl px-3 md:px-4 lg:px-6 mx-auto',
};

export let Container = forwardRef<HTMLElement, ContainerProps>((props, ref) => {
  let {
    as: Component = 'div',
    width,
    children,
    verticalPadding,
    divider,
    className,
    ...rest
  } = props;
  return (
    <Component
      {...rest}
      className={clsx(
        widthClasses[width!],
        verticalPaddingClasses[verticalPadding!],
        dividerClasses[divider!],
        className,
      )}
      ref={ref}
    >
      {children}
    </Component>
  );
});

Container.defaultProps = {
  as: 'div',
  width: 'fixed',
  verticalPadding: 'medium',
  divider: 'none',
};

export let containerConfigs: InspectorGroup = {
  group: 'General',
  inputs: [
    {
      type: 'select',
      name: 'width',
      label: 'Container width',
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
  ],
};
