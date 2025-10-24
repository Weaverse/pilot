import { cn } from "~/utils/cn";

export function Spinner({
  className,
  size = 32,
  duration = 500,
}: {
  className?: string;
  size?: number;
  duration?: number;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex items-center justify-center",
        className,
      )}
      style={
        {
          "--spinner-size": `${size}px`,
          "--spinner-duration": `${duration}ms`,
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          "[animation-duration:var(--spinner-duration)] animate-spin",
          "size-(--spinner-size) rounded-full",
          "border-2 border-gray-300 border-t-gray-600",
        )}
      />
    </div>
  );
}
