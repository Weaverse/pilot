import clsx from 'clsx';
import {useState} from 'react';
import {IconClose} from '.';

const variants = {
  default: '',
  search:
    'px-0 py-2 text-2xl w-full focus:ring-0 border-x-0 border-t-0 transition border-b-2 border-bar/10 focus:border-bar/50',
  minisearch:
    'hidden md:inline-block text-left lg:text-right border-b transition border-transparent -mb-px border-x-0 border-t-0 appearance-none px-0 py-1 focus:ring-transparent placeholder:opacity-20 placeholder:text-inherit focus:border-bar/50',
  error: 'border-red-500',
};

export function Input({
  className = '',
  type,
  variant = 'default',
  prefix,
  suffix,
  onFocus,
  onBlur,
  ...rest
}: {
  className?: string;
  type?: string;
  variant?: 'default' | 'search' | 'minisearch' | 'error';
  [key: string]: any;
}) {
  let [focused, setFocused] = useState(false);
  let commonClasses = clsx(
    'w-full rounded-sm border px-3 py-2.5',
    focused ? 'border-bar/50' : 'border-bar/10',
    className,
  );

  let handleClear = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.previousSibling.value = '';
  };
  if (type === 'search') {
    suffix = <IconClose onClick={handleClear} />;
  }
  let hasChild = Boolean(prefix || suffix);

  let rawInput = (
    <input
      // type={type}
      className={clsx(
        'w-full focus-visible:outline-none !shadow-none focus:ring-0',
        hasChild ? 'grow border-none bg-transparent p-0' : commonClasses,
        variants[variant],
      )}
      onFocus={(e) => {
        setFocused(true);
        if (onFocus) onFocus(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        if (onBlur) onBlur(e);
      }}
      {...rest}
    />
  );

  return hasChild ? (
    <div
      className={clsx(
        commonClasses,
        'flex gap-2 overflow-hidden items-center bg-primary p-2.5 border rounded-sm',
      )}
    >
      {prefix}
      {rawInput}
      {suffix}
    </div>
  ) : (
    rawInput
  );
}
