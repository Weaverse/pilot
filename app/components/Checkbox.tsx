import clsx from 'clsx';
import {InputHTMLAttributes} from 'react';

export function Checkbox(props: InputHTMLAttributes<HTMLInputElement>) {
  let {className = '', ...rest} = props;
  return (
    <input
      type="checkbox"
      className={clsx(
        'form-checkbox rounded-sm cursor-pointer shadow-none text-btn',
        className,
      )}
      {...rest}
    />
  );
}
