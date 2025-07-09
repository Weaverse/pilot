import clsx from "clsx";

export function ProductTag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={clsx(["px-2 py-1.5 text-sm", className])}>{children}</span>
  );
}
