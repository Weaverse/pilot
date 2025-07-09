import { cn } from "~/utils/cn";

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
        "grid w-full grid-flow-col justify-start gap-4",
        "snap-x snap-mandatory",
        "hidden-scroll scroll-px-6 overflow-x-scroll",
        className,
      ])}
    >
      {children}
    </div>
  );
}
