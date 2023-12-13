import {forwardRef} from 'react';
import {Link} from '@remix-run/react';
import clsx from 'clsx';

import {missingClass} from '~/lib/utils';

export const Button = forwardRef(
  (
    {
      as = 'button',
      className = '',
      variant = 'primary',
      width = 'auto',
      ...props
    }: {
      as?: React.ElementType;
      className?: string;
      variant?: 'primary' | 'secondary' | 'inline' | 'secondary-white';
      width?: 'auto' | 'full';
      [key: string]: any;
    },
    ref,
  ) => {
    const Component = props?.to ? Link : as;

    const baseButtonClasses =
      'inline-block rounded font-medium text-center py-3 px-4 text-sm font-medium';

    const disabledClasses =
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:select-none disabled:hover:bg-btn disabled:hover:text-btn-content';

    const variants = {
      primary: `${baseButtonClasses} border-2 border-btn hover:bg-inv-btn hover:text-inv-btn-content bg-btn text-btn-content`,
      secondary: `${baseButtonClasses} border-2 border-btn text-btnTextInverse hover:bg-btn hover:text-btn-content`,
      'secondary-white': `${baseButtonClasses} border-2 border-inv-btn text-btn hover:bg-inv-btn hover:text-inv-btn-content`,
      inline: 'border-b border-bar/10 leading-none pb-1',
    };

    const widths = {
      auto: 'w-auto',
      full: 'w-full',
    };

    const styles = clsx(
      missingClass(className, 'bg-') && variants[variant],
      missingClass(className, 'w-') && widths[width],
      disabledClasses,
      className,
    );

    return (
      <Component
        // @todo: not supported until react-router makes it into Remix.
        // preventScrollReset={true}
        className={styles}
        {...props}
        ref={ref}
      />
    );
  },
);
