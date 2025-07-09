import { cn } from "~/utils/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex items-center justify-center bg-gray-100",
        className,
      )}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
    </div>
  );
}
