import { cn } from "~/lib/cn";

export function Swimlane({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn([
        "grid grid-flow-col gap-4 w-full justify-start",
        "snap-x snap-mandatory",
        "scroll-px-6 overflow-x-scroll hidden-scroll",
        className,
      ])}
    >
      {children}
    </div>
  );
}
