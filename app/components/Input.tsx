import clsx from 'clsx';

const INPUT_STYLE_CLASSES =
'border border-bar/50 rounded-sm bg-transparent text-body py-2.5 px-3 w-full leading-tight'

export function Input({
  className = '',
  type,
  variant = 'default',
  ...props
}: {
  className?: string;
  type?: string;
  variant?: 'default' | 'search' | 'minisearch' | 'error';
  [key: string]: any;
}) {
  const variants = {
    default: '',
    search:
      'px-0 py-2 text-2xl w-full focus:ring-0 border-x-0 border-t-0 transition border-b-2 border-bar/10 focus:border-bar/90',
    minisearch:
      'hidden md:inline-block text-left lg:text-right border-b transition border-transparent -mb-px border-x-0 border-t-0 appearance-none px-0 py-1 focus:ring-transparent placeholder:opacity-20 placeholder:text-inherit',
      error: 'border-red-500',
  };

  const styles = clsx(INPUT_STYLE_CLASSES, variants[variant], className);

  return <input type={type} {...props} className={styles} />;
}
