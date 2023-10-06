import clsx from 'clsx';

const INPUT_STYLE_CLASSES =
'border border-border/50 rounded-sm bg-transparent text-text py-2.5 px-3 w-full leading-tight'

export function Input({
  className = '',
  type,
  variant = 'default',
  ...props
}: {
  className?: string;
  type?: string;
  variant?: 'default' | 'search' | 'minisearch';
  [key: string]: any;
}) {
  const variants = {
    default: '',
    search:
      'px-0 py-2 text-heading w-full focus:ring-0 border-x-0 border-t-0 transition border-b-2 border-primary/10 focus:border-primary/90',
    minisearch:
      'hidden md:inline-block text-left lg:text-right border-b transition border-transparent -mb-px border-x-0 border-t-0 appearance-none px-0 py-1 focus:ring-transparent placeholder:opacity-20 placeholder:text-inherit',
  };

  const styles = clsx(INPUT_STYLE_CLASSES, variants[variant], className);

  return <input type={type} {...props} className={styles} />;
}
