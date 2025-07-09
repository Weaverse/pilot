import clsx from "clsx";

/**
 * A shared component and Suspense call that's used in `App.server.jsx` to let your app wait for code to load while declaring a loading state
 */
export function Skeleton({
  as: Component = "div",
  width,
  height,
  className,
  ...props
}: {
  as?: React.ElementType;
  width?: string;
  height?: string;
  className?: string;
  [key: string]: any;
}) {
  return (
    <Component
      {...props}
      width={width}
      height={height}
      className={clsx("animate-pulse bg-gray-300", className)}
    />
  );
}
