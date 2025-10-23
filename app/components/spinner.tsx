import { cn } from "~/utils/cn";

export function Spinner({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "size-4 border-2",
    md: "size-8 border-2",
    lg: "size-12 border-[3px]",
  };

  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex items-center justify-center",
        className,
      )}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-gray-300 border-t-gray-600",
          sizeClasses[size],
        )}
      />
    </div>
  );
}
