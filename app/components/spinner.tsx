import { cn } from "~/utils/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex items-center justify-center",
        className,
      )}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
    </div>
  );
}

export function SpinnerIcon({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-5 w-5 border-2",
    lg: "h-8 w-8 border-2",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-white/30 border-t-white",
        sizeClasses[size],
        className,
      )}
    />
  );
}
