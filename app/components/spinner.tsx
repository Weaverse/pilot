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
    <span
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
      <span
        className={cn(
          "animate-spin [animation-duration:var(--spinner-duration)]",
          "inline-block size-(--spinner-size) rounded-full",
          "border-2 border-gray-300 border-t-gray-600",
        )}
      />
    </span>
  );
}
