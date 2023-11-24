import {clsx} from 'clsx';

type HeadingProps = {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode | string;
  className?: string;
};

export function Heading(props: HeadingProps) {
  let {as: Tag = 'h1', children, className} = props;
  return <Tag className={clsx('font-medium', className)}>{children}</Tag>;
}
