import clsx from "clsx";

export function ProductTag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={clsx(["py-1.5 px-2 text-sm", className])}>{children}</span>
  );
}
